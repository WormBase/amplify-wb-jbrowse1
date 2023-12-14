# MotifSearch
JBrowse plugin - Finds sequence motifs with a Position Weight Matrix

Currently, this plugin has no configurable options.  In the future, I'd like to
support having the motifs read from a json file rather than being hard coded
into js/View/SearchSeqDialog.js.

## Install

* Clone repo into plugins folder in JBrowse and name the folder MotifSearch
* Add "plugins" : ["MotifSearch"] to jbrowse_conf.json.

## Adding your own list of motifs.

At the moment, this is a little tedious, as you have to edit js/View/SearchSeqDialog.js file
directly to change the list of motifs.  For now, this is what you need
to do:

* Find the "content.matrices = [" line in the code 
* Edit the data structure to remove the matrices you don't want and using
the same data structure, add the matrices you do want and save.
* Run ./setup.sh again to have the changes incorporated into the JBrowse
webpack.

## Working example

Generally, there should always be a working example of this plugin running
at 

  https://staging.wormbase.org/tools/genome/jbrowse-simple/?data=data%2Fc_elegans_PRJNA13758

which is the staging web site for WormBase.  Of course, the staging site
might go up or down during development, but it will generally have the most
bleeding edge version of MotifSearch.  The WormBase production site may not have
the most recent version of MotifSearch, but will be more reliable:

  https://www.wormbase.org/tools/genome/jbrowse-simple/?data=data%2Fc_elegans_PRJNA13758


## Acknowledgements

I would like to thank Pierre Lindenbaum at l'institut du thorax in Nantes, 
France who posted this JavaScript note that got ms thinking about writing 
this plugin for JBrowse: https://www.biostars.org/p/90823/, Chris Grove at
WormBase for considerable feedback on the user interface, and Colin Diesh
for much help with the intricacies of JBrowse's plugin system.

Scott Cain
October 7, 2019

