#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const colon = encodeURIComponent(':');
const fs = require('fs');
const mkdirp = require('mkdirp');
const program = require('commander');

const imageHelp = `
  Image quality:
    Best image quality is achieved with:
      --imgType png --quality 3
`
const bedHelp = `
  --locs bed file:

    Can include comment lines to switch the baseUrl used for the next block of
    coordinates.

    Any comment line will be processed into a datasource ($DS) name and URL.  Files generated will be
    output to a subfolder of the specified --output area as $OUTPUT/$DS/$CHR-$START_$END.

    FORMAT:

      # DATASET_NAME URL
      CHR START END
      # DATASET_NAME2 URL
      CHR START END
      ...
`

function urlCleaning(timeout, outdir, url, subdir) {
  // Handle standard cleaning of the URL
  let address = url
    .replace(/loc=[^&]?/, '')
    .replace(/&tracklist=[^&]?/, '')
    .replace(/&nav=[^&]?/, '')
    .replace(/&fullviewlink=[^&]?/, '')
    .replace(/&highres=[^&]?/, '')
    .replace(/&highlight=[^&]?/, '');

  // turn off track list and fullview
  address += '&tracklist=0&fullviewlink=0&highres='+program.quality;
  if(program.navOff) { // optionally turn of the navigation tools
    address += '&nav=0';
  }
  // cleanup any multiples of &&
  address = address.replace(/[&]+/g,'&');
  const tracks = address.match(/tracks=[^&]+/)[0].split(/%2C/g);
  let outloc;
  if(subdir != null) {
    outloc = path.join(program.outdir, subdir);
  }
  else {
    outloc = program.outdir;
  }
  return {
    outloc: outloc,
    url: address,
    timeout: (30 + (program.timeout * tracks.length)) * 1000
  }
}

program
  .description('Generate images against a JBrowse server')
  .option('-l, --locs <file>', 'Bed file of locations, see --help')
  .option('-b, --baseUrl [value]', 'URL from pre configured JBrowse webpage, ommit if provided in BED file')
  .option('-w, --width [n]', 'Width of image', 600)
  .option('-i, --imgType [value]', 'Type of image (jpeg|png)', 'png')
  .option('-o, --outdir [value]', 'Output folder', './')
  .option('-n, --navOff', 'Remove nav bars', false)
  .option('    --highlight', 'Highlight region (for short events)', false)
  .option('-q, --quality [n]', 'Image resolution (1..3)', 3)
  .option('-p, --passwdFile [file]', 'User password for httpBasic')
  .option('-t, --timeout [n]', 'For each track allow upto N sec.', 10)
  .version('0.1.0', '-v, --version')
  .on('--help', function() {
    console.log("\n  Additional information:");
    console.log(imageHelp);
    console.log(bedHelp);
  })
  .parse(process.argv);

if (process.argv.length < 3 || program.args.length > 0) {
  program.help()
}

program.width = parseInt(program.width)
program.timeout = parseInt(program.timeout)
program.quality = parseInt(program.quality)

let locations = [];
if(program.baseUrl) {
  locations.push(urlCleaning(program.timeout, program.outdir, program.baseUrl, null));
}

// read in the bed locations
const rawLocs = fs.readFileSync(program.locs, "utf-8").split(/\r?\n/)
for(let rawLoc of rawLocs) {
  if(rawLoc.length === 0) continue;
  if(rawLoc.startsWith('#')) {
    if(program.baseUrl) {
      console.error('ERROR: Dataset/URL cannot be defined in BED file when --baseUrl provided');
      process.exit(1);
    }
    rawLoc = rawLoc.replace(/^#\s+/, '');
    const groups = rawLoc.match(/([^\s]+)\s+(http.+)/);
    locations.push(urlCleaning(program.timeout, program.outdir, groups[2], groups[1]));
    continue;
  }

  const elements = rawLoc.split(/\t/);
  if(elements.length !== 3) continue;
  let start = parseInt(elements[1]);
  const end = parseInt(elements[2]);
  if(start >= end) {
    console.warn('Skipping: bed location malformed: ' + rawLoc);
    continue;
  }
  start += 1;
  locations.push({
    urlElement: elements[0] + colon + start + '..' + end,
    realElement: elements[0] + ':' + start + '..' + end,
    fileElement: elements[0] + '_' + start + '-' + end
  });
}

// load password if needed
let passwd;
if(program.passwdFile) passwd = fs.readFileSync(program.passwdFile, "utf-8").replace(/\r?\n/g, '');

// menubar 27
// navbox 33
// overview 22 (surrounds overviewtrack_overview_loc_track)
// static_track 14
let minHeight = 96;
if(program.navOff) minHeight = 26;

(async () => {
  const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});
  const page = await browser.newPage();
  await page.setCacheEnabled(true);
  if(passwd) {
    await page.authenticate({username: process.env.USER, password: passwd});
  }

  let {address, timeout, outloc} = ['', 0, ''];

  for (const loc of locations) {
    if(loc.url) {
      address = loc.url;
      timeout = loc.timeout;
      outloc = loc.outloc;
      // make sure we have somewhere to write to:
      mkdirp(outloc, function (err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
      continue;
    }
    process.stdout.write('Processing: '+loc.realElement);
    const started = Date.now();
    // need to reset each time
    await page.setViewport({width: program.width, height: 2000});
    let fullAddress = address+'&loc='+loc.urlElement;
    if(program.highlight) {
      fullAddress += '&highlight='+loc.urlElement;
    }
    const response = await page.goto(
      fullAddress, {
        timeout: timeout,
        waitUntil: ['load', 'domcontentloaded', 'networkidle0']
      });
    if(! response.ok()) {
      console.error("\nERROR: Check you connection and if you need to provide a password (http error code: "+response.status()+')');
      process.exit(1);
    }

    let trackHeight = minHeight;
    const divs = await page.$$('.track');
    for (const d of divs) {
      const propId = await d.getProperty('id')
      const id = await propId.jsonValue();
      if(id == 'gridtrack' || id == 'overviewtrack_overview_loc_track' || id == 'static_track') {
        continue;
      }

      const bb = await d.boundingBox();
      trackHeight += bb.height;
    }
    await page.setViewport({width: program.width, height: trackHeight});
    let shotOpts = {
      path: path.join(outloc, loc.fileElement+'.'+program.imgType),
      fullPage: false
    }
    if(program.imgType === 'jpeg' && program.quality === 3) shotOpts['quality'] = 100;
    await page.screenshot(shotOpts);
    const took = Date.now() - started;
    console.log(' ('+took/1000+' sec.)')
  }

  await browser.close();
})();
