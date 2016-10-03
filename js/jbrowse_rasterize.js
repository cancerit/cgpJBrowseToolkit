var casper = require('casper').create({
  verbose: true,
  logLevel: "warning"
});
var system = require('system');

var usage = "\nUSAGE: jbrowse_rasterize.js --width=<int> --imgType=<bmp|jpeg|pdf|png> --baseUrl=<url> --locs=<locations.bed> --outdir=<outdir> [--passwdFile=<file>] \n"
            +"\tNOTE: if '--imgType=pdf' please set '--pdfHeight=<required height>\n";

if (Object.keys(casper.cli.options).length < 7) {
  console.log(usage);
  phantom.exit(1);
}

if(casper.cli.args.length !== 0) {
  console.log("\nERROR: Please check that all options are of the form '--option=value', '--baseUrl' will require single quoting");
  console.log(usage);
  phantom.exit(1);
}

var passwdFile = casper.cli.get("passwdFile");
var width      = casper.cli.get("width");
var outType    = casper.cli.get("imgType");
var baseUrl    = casper.cli.get("baseUrl");
var locs       = casper.cli.get("locs");
var outDir     = casper.cli.get("outdir");

var viewPortHeight = 2000;
if(outType === 'pdf') {
  var pdfHeight  = casper.cli.get("pdfHeight");
  if(pdfHeight == null) {
    console.log("\nERROR: Please set '--pdfHeight'\n");
    console.log(usage);
    phantom.exit(1);
  }
  viewPortHeight = pdfHeight;
}

// remove loc and highlight elements of url
var address = baseUrl.replace(/loc=[^&]+&/, '').replace('&highlight=', '');

var fs = require('fs');
var rawLocs = fs.read(locs).split(/\r?\n/)
var passwd;

if(passwdFile != null) passwd = fs.read(passwdFile).replace(/\r?\n/g, '');

// setup page stuff here
pageWidth = parseInt(width);

// base initial wait time on number of tracks to render (allow loading of indexes etc)
var pageWait = 1 + (decodeURIComponent(address).match(/,/g) || []).length;
var initWait = pageWait * 2; // additional time for any index files to stage

// first cleanup the input into json objects
var locations = [];
for(var i=0; i<rawLocs.length; i++) {
  if(rawLocs[i].length === 0) continue;
  var elements = rawLocs[i].split(/\t/);
  if(elements.length !== 3) continue;
  locations[locations.length] = { 'chr': elements[0],
                                  'start': elements[1],
                                  'end': elements[2] };
}

var colon = encodeURIComponent(':');

casper.start();

if(passwd != null) casper.setHttpAuth(system.env.USER, passwd);

casper.thenOpen(address, function() {
  this.viewport(pageWidth, viewPortHeight);
  this.echo('Initialisation of cache... ('+ initWait+' sec.)');
  this.wait(initWait * 1000);
})

casper.then(function() {
  for (var current = 0; current < locations.length; current++) {
    (function(cntr) {
      var output = outDir + '/' + locations[cntr].chr + '_' + locations[cntr].start + '-' + locations[cntr].end + '.' + outType;
      var url = address+'&loc=' +locations[cntr].chr + colon + locations[cntr].start + '..' + locations[cntr].end;
      casper.thenOpen(url, function() {
        casper.echo('Processing url: ' + url);
        this.viewport(pageWidth, viewPortHeight);
        this.wait(pageWait * 1200);
        // this calculates the actual height of the track divs, excluding the grid lines layer
        this.then(function() {
          var height = this.page.evaluate(function() {
            var heightSum = 0;
            var trackDivs = document.getElementById("zoomContainer").children[0].children[0].children;
            for(var i=0, len = trackDivs.length ; i < len; i++) {
              if(trackDivs[i].id === 'gridtrack') continue;
              heightSum += trackDivs[i].offsetHeight;
            }
            return heightSum;
          });
          // here we can download stuff
          this.then(function() {
            this.echo('\tCapturing to: ' + output, 'info');
            this.capture(output, { top: 0, left: 0, width: pageWidth, height: height + 150 });
          });
        });
      });
    })(current);
  }
});

casper.run();
