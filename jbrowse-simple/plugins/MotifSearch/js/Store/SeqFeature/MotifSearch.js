
define([
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'JBrowse/Store/SeqFeature',
        'JBrowse/Model/SimpleFeature',
        'JBrowse/Errors',
        'JBrowse/Util'
    ],
    function(
        declare,
        array,
        lang,
        SeqFeatureStore,
        SimpleFeature,
        JBrowseErrors,
        Util
    ) {


    return declare( SeqFeatureStore , {

        constructor: function( args ) {
            this.searchParams = args.searchParams;
        },

        _defaultConfig: function() {
            return Util.deepUpdate(
                dojo.clone( this.inherited(arguments) ),
                {
                    regionSizeLimit: 500000 // 500kb
                });
        },

        getFeatures: function( query, featCallback, doneCallback, errorCallback ) {
            var searchParams = lang.mixin(
                // store the original query bounds - this helps prevent features from randomly disappearing
                { orig: { start: query.start, end: query.end }},
                this.searchParams,
                query.searchParams
            );

            var regionSize = query.end - query.start;
            if( regionSize > this.config.regionSizeLimit )
                throw new JBrowseErrors.DataOverflow( 'Region too large to search' );

            var thisB = this;
            this.browser.getStore('refseqs', function( refSeqStore ) {
                if( refSeqStore )
                    refSeqStore.getReferenceSequence(
                        query,
                        function( sequence ) {
                            thisB.doSearch( query, sequence, searchParams, featCallback );
                            doneCallback();
                        },
                        errorCallback
                    );
                 else
                     doneCallback();
             });
        },

        doSearch: function( query, sequence, params, featCallback ) {
            var pfm = [
                params.matrix_A,
                params.matrix_C,
                params.matrix_G,
                params.matrix_T
            ];
            var ncols = pfm[0].length;
            var pwm = [
                new Array(ncols),
                new Array(ncols),
                new Array(ncols),
                new Array(ncols)
            ];

            var prob_base = [0.32,0.18,0.18,0.32];
            /* convert pfm to pwm */
            for(var x=0;x<ncols;++x) {
                var total=0;
                for(var y=0;y<4;++y) total+=pfm[y][x];
                for(var y=0;y<4;++y) {
                    var freq=pfm[y][x];
                    var w= Math.log2 ( ( freq + Math.sqrt(total) * prob_base[y] ) / ( total + Math.sqrt(total) ) / prob_base[y] );
                    pwm[y][x]=w;
                }
            }

            //calc max possible score
            var max_possible = 0;
            var min_possible = 0;
            for (var x=0;x<ncols;x++) {
                var local_max = -1000;
                var local_min = 1000;
                for (var y=0;y<4;y++) {
                    if (local_max < pwm[y][x]) {
                        local_max = pwm[y][x];
                    }
                    if (local_min > pwm[y][x]) {
                        local_min = pwm[y][x];
                    }
                }
                max_possible = max_possible + local_max;
                min_possible = min_possible + local_min;
            }


            //console.log(min_possible);
            //console.log(pwm[0]);
            //console.log(pwm[1]);
            //console.log(pwm[2]);
            //console.log(pwm[3]);

            var min_score = params.minscore;

            var min_absscore = max_possible- (1-min_score/100)*(max_possible - min_possible);
            //console.log(min_absscore);

            var sequences = [];
            sequences.push( [sequence,1] );
            sequences.push( [Util.revcom( sequence ),-1] );

            //console.log(sequences[0]);

            array.forEach( sequences, function(r) {
                    this._searchSequence( query, r[0], r[1], pwm, min_score, max_possible, min_possible,min_absscore,featCallback );
            }, this );

//            this._searchSequence(query, sequence, strand, pwm, min_score, max_possible, min_possible,min_absscore, featCallback);
        },

        _searchSequence: function( query, sequence, strand, pwm, min_score, max_possible, min_possible,min_absscore, featCallback ) {

            var start = query.start, end = query.end;
            var len   = pwm[0].length;
            var features = [];
            var match;

            /* step through every spot in the sequence */

            for (var i = 0; i<(sequence.length -len +1);i++) {
            //    if (i%10 == 0) {
            //        console.log(i);
            //    }
                var substr = sequence.substring(i,i+len);

            //    var score = compute_pwm_score(pwm,substr);

                var score=0.0;
                var pwm_ncol = pwm[0].length;
               // console.log(pwm_ncol);
                for (var x = 0; x < pwm_ncol; x++) {
                    var y = -1;
                    switch(substr.charAt(x)) {
                        case 'a':case 'A': y=0; break;
                        case 'c':case 'C': y=1; break;
                        case 't':case 'T': y=3; break;
                        case 'g':case 'G': y=2; break;
                    }
                    if (y == -1) continue;
                    score += pwm[y][x];
                    // console.log(score);
                }

                //console.log(score);

                if (score > min_absscore) {
                    // console.log('creating feature');
                    var rel_score = (1- (max_possible - score)/(max_possible-min_possible))*100;
                    var result   = substr;
                    var newStart = strand>0 ? start + i       : end - (i+len);
                    var newEnd   = strand>0 ? start + (i+len) : end - i;

                    //console.log(newStart + ' ' + newEnd);

                    var newFeat = new SimpleFeature(
                      {
                        data: {
                            start: newStart,
                            end: newEnd,
                            searchMatch: result,
                            rawscore: score,
                            relscore: rel_score,
                            strand: strand
                        },
                        id: [newStart,newEnd,result].join(',')
                      });
                    featCallback( newFeat );
                }
            }
        },

        //compute_pwm_score: function( pwm, S) {
        //    var score=0.0;
        //    var pwm_ncol = pwm[0].length;
        //    score = 0.00;
        //    for (var x = 0; x < pwm_ncol; x++) {
        //        var y = -1;
        //        switch(S.charAt(offset+x)) {
        //                case 'a':case 'A': y=0; break;
        //                case 'c':case 'C': y=1; break;
        //                case 't':case 'T': y=2; break;
        //                case 'g':case 'G': y=3; break;
        //        }
        //        if (y == -1) continue;
        //        score += pwm[y][x];
        //    }
        //    return score;
        //}
    });
});

