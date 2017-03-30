var casper = require('casper').create({
  verbose: true,
  logLevel: "warning",
  retryTimeout: 1200
});
//casper.options.retryTimeout=1000;
var system = require('system');

var usage = "\nUSAGE: jbrowse_rasterize.js --width=<int> --imgType=<bmp|jpeg|pdf|png> --baseUrl=<url> --locs=<locations.bed> --outdir=<outdir> [--passwdFile=<file>] [--navOff]\n"
            +"\tNOTE: if '--imgType=pdf' please set '--height=<required height>\n";


if (Object.keys(casper.cli.options).length < 7) {
  console.log(usage);
  phantom.exit(1);
}

var thisScript = system.args[3];
var cacheChk = thisScript.replace(/js\/jbrowse_rasterize.js$/, 'scripts/cacheChk.sh');

if(casper.cli.args.length !== 0) {
  console.log("\nERROR: Please check key/value options are of the form '--option=value', '--baseUrl' value will require single quoting");
  console.log(usage);
  phantom.exit(1);
}

var passwdFile = casper.cli.get("passwdFile");
var width      = casper.cli.get("width");
var outType    = casper.cli.get("imgType");
var baseUrl    = casper.cli.get("baseUrl");
var locs       = casper.cli.get("locs");
var outDir     = casper.cli.get("outdir");
var navOff     = casper.cli.has("navOff");

var viewPortHeight = 2000;
var height;
if(casper.cli.has("height")) {
  height = casper.cli.get("height");
  if(height > viewPortHeight) {
    viewPortHeight = height;
  }
}

if(outType === 'pdf') {
  var pdfHeight  = casper.cli.get("height");
  if(pdfHeight == null) {
    console.log("\nERROR: Please set '--height'\n");
    console.log(usage);
    phantom.exit(1);
  }
  viewPortHeight = pdfHeight;
}

var fs = require('fs');
var rawLocs = fs.read(locs).split(/\r?\n/)
var passwd;

if(passwdFile != null) passwd = fs.read(passwdFile).replace(/\r?\n/g, '');

//get track count
var trackCount = decodeURIComponent(baseUrl).match(/&tracks=([^$]+)/)[0].replace("&tracks=","").split(/,/).length;
if(trackCount === 0) {
  console.log("\nERROR: The URL provided has no tracks selected\n");
  phantom.exit(1);
}

// Handle standard cleaning of the URL
var address = baseUrl.replace(/loc=[^&]+/, '').replace(/&tracklist=[01]/, '').replace(/&nav=[01]/, '').replace(/&fullviewlink=[01]/, '').replace('&highlight=', '');
// turn off track list
address += '&tracklist=0';
// turn off fullviewlink
address += '&fullviewlink=0';
if(navOff) { // optionally turn of the navigation tools
  address += '&nav=0';
}
// cleanup any multiples of &&
address = address.replace(/[&]+/g,'&');

// setup page stuff here
pageWidth = parseInt(width);

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
var loadTimeout = trackCount * 10; // seconds, converted later
if(loadTimeout < 30) {loadTimeout = 30;}

casper.start();

if(passwd != null) casper.setHttpAuth(system.env.USER, passwd);

casper.then(function() {
  for (var current = 0; current < locations.length; current++) {
    (function(cntr) {
      var output = outDir + '/' + locations[cntr].chr + '_' + locations[cntr].start + '-' + locations[cntr].end + '.' + outType;
      var url = address+'&loc=' +locations[cntr].chr + colon + locations[cntr].start + '..' + locations[cntr].end;
      casper.thenOpen(url, function() {
        this.echo('Processing url: ' + url);
        this.viewport(pageWidth, viewPortHeight);
        this.then(function() {
          this.waitFor(function check() {
            return this.evaluate(function(expTracks) {
              return document.readyState === "complete"
                      && document.getElementsByClassName('innerTrackContainer')[0].getElementsByClassName('track').length === expTracks + 1
                      && document.getElementsByClassName('loading').length === 0;
            }, trackCount);
          }, function then() {    // step to execute when check() is ok
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
          }, function timeout() { // step to execute if check has failed
              this.echo("Track divs still loading after "+loadTimeout+" second(s) have elapsed, aborting").exit();
          }, loadTimeout*1000);
        });
        // this calculates the actual height of the track divs, excluding the grid lines layer
      });
    })(current);
  }
});

casper.run();
