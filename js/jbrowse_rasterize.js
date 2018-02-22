#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const colon = encodeURIComponent(':');
const fs = require('fs');
const mkdirp = require('mkdirp');
const program = require('commander');

program
  .arguments('')
  .option('-b, --baseUrl <value>', 'URL from pre configured JBrowse webpage')
  .option('-l, --locs <value>', 'Bed file of locations')
  .option('-w, --width [n]', 'Width of image', 600)
  .option('-i, --imgType [value]', 'Type of image (jpeg|png)', 'png')
  .option('-o, --outdir [value]', 'Output folder', './')
  .option('-n, --navOff', 'Remove nav bars', false)
  .option('    --highlight', 'Highlight region (for short events)', false)
  .option('-p, --passwdFile [file]', 'User password for httpBasic')
  .option('-t, --timeout [n]', 'For each track allow upto N sec.', 10)
  .version('0.1.0', '-v, --version')
  .parse(process.argv);

if (process.argv.length < 3 || program.args.length > 0) {
  program.help()
}

program.width = parseInt(program.width)
program.timeout = parseInt(program.timeout)

// read in the bed locations
const rawLocs = fs.readFileSync(program.locs, "utf-8").split(/\r?\n/)
let locations = [];
for(const rawLoc of rawLocs) {
  if(rawLoc.length === 0) continue;
  const elements = rawLoc.split(/\t/);
  if(elements.length !== 3) continue;
  let start = parseInt(elements[1]);
  const end = parseInt(elements[2]);
  if(start >= end) {
    console.warn('Skipping: bed location malformed: ' + rawLoc);
    continue;
  }
  start += 1;
  locations[locations.length] = {
    urlElement: elements[0] + colon + start + '..' + end,
    realElement: elements[0] + ':' + start + '..' + end,
    fileElement: elements[0] + '_' + start + '-' + end
  };
}

// load password if needed
let passwd;
if(program.passwdFile) passwd = fs.readFileSync(program.passwdFile, "utf-8").replace(/\r?\n/g, '');

// Handle standard cleaning of the URL
let address = program.baseUrl
  .replace(/loc=[^&]?/, '')
  .replace(/&tracklist=[^&]?/, '')
  .replace(/&nav=[^&]?/, '')
  .replace(/&fullviewlink=[^&]?/, '')
  .replace(/&highres=[^&]?/, '')
  .replace(/&highlight=[^&]?/, '');

const tracks = address.match(/tracks=[^&]+/)[0].split(/%2C/g);

// turn off track list and fullview
address += '&tracklist=0&fullviewlink=0&highres=auto';
if(program.navOff) { // optionally turn of the navigation tools
  address += '&nav=0';
}
// cleanup any multiples of &&
address = address.replace(/[&]+/g,'&');

// make sure we have somewhere to write to:
mkdirp(program.outdir, function (err) {
  if (err) console.error(err)
});

// menubar 27
// navbox 33
// overview 22 (surrounds overviewtrack_overview_loc_track)
// static_track 14
let minHeight = 96;
if(program.navOff) minHeight = 26;

(async () => {
  const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout((30 + (program.timeout * tracks.length)) * 1000);
  await page.setCacheEnabled(true);
  if(passwd) {
    await page.authenticate({username: process.env.USER, password: passwd});
  }

  for (const loc of locations) {
    process.stdout.write('Processing: '+loc.realElement);
    const started = Date.now();
    // need to reset each time
    await page.setViewport({width: program.width, height: 2000});
    fullAddress = address+'&loc='+loc.urlElement;
    if(program.highlight) {
      fullAddress += '&highlight='+loc.urlElement;
    }
    const response = await page.goto(fullAddress, {waitUntil: ['load', 'domcontentloaded', 'networkidle0']});
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
    await page.screenshot({
      path: path.join(program.outdir, loc.fileElement+'.'+program.imgType),
      fullPage: false,
    });
    const took = Date.now() - started;
    console.log(' ('+took/1000+' sec.)')
  }

  await browser.close();
})();
