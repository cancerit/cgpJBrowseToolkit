#!/usr/bin/env node

/**
 * Copyright (c) 2016-2018 Genome Research Ltd.
 *
 * Author: CASM/Cancer IT <cgphelp@sanger.ac.uk>
 *
 * This file is part of cgpJBrowseToolkit.
 *
 * cgpJBrowseToolkit is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * 1. The usage of a range of years within a copyright statement contained within
 * this distribution should be interpreted as being equivalent to a list of years
 * including the first and last year specified and all consecutive years between
 * them. For example, a copyright statement that reads ‘Copyright (c) 2005, 2007-
 * 2009, 2011-2012’ should be interpreted as being identical to a statement that
 * reads ‘Copyright (c) 2005, 2007, 2008, 2009, 2011, 2012’ and a copyright
 * statement that reads ‘Copyright (c) 2005-2012’ should be interpreted as being
 * identical to a statement that reads ‘Copyright (c) 2005, 2006, 2007, 2008,
 * 2009, 2010, 2011, 2012’."
 */

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
  process.exit(1);
})

const VERSION = require('./version.js');

const puppeteer = require('puppeteer');
const path = require('path');
const colon = encodeURIComponent(':');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Mode = require('stat-mode');

/**
 * Process command line args and check validity
 *
 * @return {object} A commander object
 */
function cliChecks() {
  const program = require('commander');
  program
    .description('Generate images against a JBrowse server')
    .option('-l, --locs <file>', 'Bed file of locations, see --help')
    .option('-b, --baseUrl [value]', 'URL from pre configured JBrowse webpage, ommit if provided in BED file')
    .option('-w, --width [n]', 'Width of image', 600)
    .option('-i, --imgType [value]', 'Type of image [jpeg|pdf|png]', 'png')
    .option('-o, --outdir [value]', 'Output folder', './')
    .option('-n, --navOff', 'Remove nav bars', false)
    .option('-d, --dMode [value]', 'Change default display of alignment tracks [normal|compact|collapsed]')
    .option('    --highlight', 'Highlight region (for short events)', false)
    .option('-q, --quality [n]', 'Image resolution [1,2,3]', '3')
    .option('-z, --zoom [n]', 'Zoom factor', 1)
    .option('-p, --passwdFile [file]', 'User password for httpBasic')
    .option('-t, --timeout [n]', 'For each track allow upto N sec.', 10)
    .version(VERSION, '-v, --version')
    .on('--help', function() {
      console.log("\n  Additional information:");
      console.log(imageHelp);
      console.log(bedHelp);
    })
    .parse(process.argv);

  if (process.argv.length < 3 || program.args.length > 0) program.help();

  if (program.dMode !== undefined && !program.dMode.match(/^(normal|compact|collapsed)$/)) {
    throwErr("ERROR: -d|--dMode only accepts values of: normal, compact, collapsed");
  }

  if (!program.imgType.match(/^(jpeg|pdf|png)$/)) {
    throwErr("ERROR: -i|--imgType only accepts values of: jpeg, pdf, png");
  }

  program.width = parseInt(program.width) || throwErr("ERROR: -w|--width not an int");
  program.timeout = parseInt(program.timeout) || throwErr("ERROR: -t|--timeout not an int");
  program.quality = parseInt(program.quality) || throwErr("ERROR: -q|--quality not an int");
  program.zoom = parseFloat(program.zoom) || throwErr("ERROR: -z|--zoom not a float");

  if(program.quality < 0 || program.quality > 3) throwErr("ERROR: -q|--quality not 1, 2 or 3");

  return program;
}

const imageHelp = `
  Image quality:
    Best image quality is achieved with pdf, but ~5x larger than png.

  Zoom:
    To allow capturing same region in a wider image as JBrowse has a maximum width per base.
`
const bedHelp = `
  --locs bed file:

    Can include comment lines to switch the baseUrl used for the next block of
    coordinates.

    Any comment line will be processed into a dataset ($DS) name and URL. Files generated will be
    output to a subfolder of the specified --output area as:

      $OUTPUT/$DS/$CHR-$START_$END.

    FORMAT:
      # DATASET_NAME URL
      CHR START END
      # DATASET_NAME2 URL
      CHR START END
      ...

    Comment/URL separator lines can be space or tab separated elements.
    BED formatted lines must be tab separated and only have 3 elements.
`

/**
 * So that we can throw custom error in an expression.
 *
 * @param {string} message - Error message
 */
function throwErr(message) {
  throw new Error(message);
}

/**
 * Cleans and configures baseUrl according to options
 *
 * @param {object} - commander object
 * @param {string} - url to be processed
 * @param {string} - subdirectory to append to options.outdir (or null)
 *
 * @return {object} - Url entities keyed as outloc, url, timeout.
 */
function urlCleaning(options, url, subdir) {
  // Handle standard cleaning of the URL
  let address = url
    .replace(/loc=[^&]?/, '')
    .replace(/&tracklist=[^&]?/, '')
    .replace(/&nav=[^&]?/, '')
    .replace(/&fullviewlink=[^&]?/, '')
    .replace(/&highres=[^&]?/, '')
    .replace(/&highlight=[^&]?/, '');

  // handle sometimes flaky 0.0.0.0 loopback
  address = address.replace(/[/]{2}0\.0\.0\.0/, '//localhost');

  // turn off track list and fullview
  address += '&tracklist=0&fullviewlink=0&highres='+options.quality;
  if(options.navOff) { // optionally turn of the navigation tools
    address += '&nav=0';
  }
  if(options.highlight) {
    fullAddress += '&highlight='+loc.urlElement;
  }
  // cleanup any multiples of &&
  address = address.replace(/[&]+/g,'&');
  const tracks = address.match(/tracks=[^&]+/)[0].split(/%2C/g);
  let outloc;
  if(subdir != null) {
    outloc = path.join(options.outdir, subdir);
  }
  else {
    outloc = options.outdir;
  }
  return {
    outloc: outloc,
    url: address,
    timeout: (30 + (options.timeout * tracks.length)) * 1000
  }
}

/**
 * Load the locations file and embed the required URLs
 *
 * @param {object} - commander object
 * @return {array} - array of objects, {urlElement, realElement, fileElement} or {outloc, url, timeout}
 */
function loadLocs(options) {
  let locations = [];
  if(options.baseUrl) {
    locations.push(urlCleaning(options, options.baseUrl, null));
  }
  // read in the bed locations
  const rawLocs = fs.readFileSync(options.locs, "utf-8").split(/\r?\n/)
  for(let rawLoc of rawLocs) {
    if(rawLoc.length === 0) continue;
    if(rawLoc.startsWith('#')) {
      if(options.baseUrl) {
        throwErr('ERROR: Dataset/URL cannot be defined in BED file when --baseUrl provided');
      }
      rawLoc = rawLoc.replace(/^#\s+/, '');
      const groups = rawLoc.match(/([^\s]+)\s+(http.+)/);
      locations.push(urlCleaning(options, groups[2], groups[1]));
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
  return locations;
}

/**
 * Get the height required for non-Track elements
 *
 * @param {object} - commander object
 * @return {number} - height in pixels
 */
function headerHeight(options) {
  // menubar 27
  // navbox 33
  // overview 22 (surrounds overviewtrack_overview_loc_track)
  // static_track 14
  let minHeight = 96;
  if(options.navOff) minHeight = 26;
  return minHeight;
}

/**
 * Load password for httpBasic from file when provided.
 *
 * @param {object} - commander object
 * @return {string|null} - Loaded password or null
 */
function loadPw(options) {
  if(options.passwdFile) {
    if(process.platform == 'win32') {
      console.warn("Windows system, cannot check or correct file permissions of --passwdFile");
    }
    else {
      const mode = new Mode(fs.statSync(options.passwdFile));
      if(mode.group.read || mode.others.read) {
        console.warn("File provided to --passwdFile is readable by people other than you, changing permissions...");
        mode.owner.execute = false;
        mode.group.read = false;
        mode.group.write = false;
        mode.group.execute = false;
        mode.others.read = false;
        mode.others.write = false;
        mode.others.execute = false;
        fs.chmodSync(options.passwdFile, mode.stat.mode);
      }
    }
    return fs.readFileSync(options.passwdFile, "utf-8").replace(/\r?\n/g, '');
  }
  return null;
}

function main() {
  const program = cliChecks();
  const locations = loadLocs(program);
  const minHeight = headerHeight(program);
  const passwd = loadPw(program);

  (async () => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});
    const page = await browser.newPage();
    await page.setCacheEnabled(true);
    if(passwd) await page.authenticate({username: process.env.USER, password: passwd});

    let {address, timeout, outloc} = ['', 0, ''];

    locLoop: for (const loc of locations) {
      if(loc.url) {
        address = loc.url;
        timeout = loc.timeout;
        outloc = loc.outloc;
        // make sure we have somewhere to write to:
        mkdirp(outloc, function (err) {
          if (err) {
            throw err;
          }
        });
        continue;
      }
      let fullAddress = address+'&loc='+loc.urlElement;
      process.stdout.write('Processing: '+fullAddress);
      const started = Date.now();

      let rendered = false;
      let tries = 1;
      while(!rendered) {
        try {
          // need to reset each time
          await page.setViewport({width: program.width, height: 2000});
          const response = await page.goto(
            fullAddress, {
              timeout: timeout,
              waitUntil: ['load', 'domcontentloaded', 'networkidle0']
            }
          );
          if(! response.ok()) {
            throwErr("ERROR: Check you connection and if you need to provide a password (http error code: "+response.status()+')');
          }

          if(program.dMode !== undefined) {
            const tracks = await page.$$('.track_jbrowse_view_track_alignments2');
            for (let t of tracks) {
              await page.evaluate((t, mode) => {
                t.track.displayMode = mode;
                t.track.layout = null;
                t.track.redraw();
              }, t, program.dMode);
            }
            await page.waitFor(500); // allow time for redraw
          }
        } catch(err) {
          if(tries === 1) console.warn();
          console.warn(err.message);
          if(tries++ < 3) {
            console.log("\tTry "+tries);
            continue;
          }
          console.error("Image not generated for: "+fullAddress);
          continue locLoop;
        }
        rendered=true;
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
      await page.setViewport({width: program.width, height: trackHeight, deviceScaleFactor: program.zoom});
      const finalPath = path.join(outloc, loc.fileElement+'.'+program.imgType);
      if(program.imgType === 'pdf') {
        await page.pdf({path: finalPath, scale: program.zoom, width: parseInt(program.width * program.zoom), height: parseInt(trackHeight * program.zoom)})
      }
      else {
        let shotOpts = {
          path: finalPath,
          fullPage: false
        }
        if(program.imgType === 'jpeg' && program.quality === 3) shotOpts['quality'] = 100;
        await page.screenshot(shotOpts);
      }
      const took = Date.now() - started;
      console.log(' ('+took/1000+' sec.)')
    }
    await browser.close();
  })();
}

try {
  main();
} catch(err) {
  console.error("\n"+err.message+"\n");
  process.exit(1);
}
