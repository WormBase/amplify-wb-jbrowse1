define([
           'dojo/_base/declare',
           'dojo/query',
   	   'dijit/form/Button',
           'JBrowse/Plugin'
       ],
       function(
           declare,
           query,
	   dijitButton,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
		
		var thisBrowser = this.browser;

                if (thisBrowser.config.show_menu && thisBrowser.config.show_nav) {
       		  var switchSelector = this.makeSelectorButton();
		

		  thisBrowser.afterMilestone('initView', function() {
	
			var myMenu = thisBrowser.menuBar;
			
        		console.log( "switcher plugin starting" );

			myMenu.appendChild(switchSelector);
		
		  })
                }
        
		console.log( "switcher plugin added" );
	},

    makeSelectorButton: function () {

        var fullurl = document.location;
        var selector = 'faceted';
        var otherSelector = 'checkboxes';
        if (String(fullurl).match('jbrowse-simple')) {
            selector = 'checkboxes';
            otherSelector = 'faceted';
        }
        var domain = 'alliance';
        if(String(fullurl).toLowerCase().match('wormbase.org')) {
            domain = 'wormbase';
        }
	
	var switchSelector = function(){
		var ele = document.getElementById("GenomeBrowser");
		var doc = document;
	
		console.log("entering switcher");

                var url;

		if (selector == 'checkboxes') {
			url = (domain == 'wormbase') ? '/tools/genome/jbrowse/': '/jbrowse/worms/jbrowse/';
                }
		else {
			url = (domain == 'wormbase') ? '/tools/genome/jbrowse-simple/' : '/jbrowse/worms/jbrowse-simple/';
		}

                var get = document.location.search;
                var get2 = get.replace(/nav=0/,'nav=1');
                var get3 = get2.replace(/overview=0/, 'overview=1');
                var get4 = get3.replace(/tracklist=0/, 'tracklist=1');
                var get5 = get4.replace(/c_elegans_simple/, 'c_elegans_PRJNA13758');
                //var newWindow = window.open(url+get5, "WormBase JBrowse");
                var newWindow = window.open(url+get5, "");

	};

	var selectSelectorButton = new dijitButton({
		className :"switcher-button",
		innerHTML:"Track selector",
		title: "Open a new window with the "+otherSelector+" track selector",
		onClick : function(){
	
			switchSelector();
		
		}
	});

	return selectSelectorButton.domNode;
    }
}); 
});
