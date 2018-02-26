# cgpJBrowseToolkit

| Master                                        | Develop                                         |
| --------------------------------------------- | ----------------------------------------------- |
| [![Master Badge][travis-master]][travis-base] | [![Develop Badge][travis-develop]][travis-base] |

Contains various scripts and tools that work with or on [JBrowse][jbrowse] that are publicly useful.

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Installation](#installation)
- [Tools](#tools)
	- [jbrowse_rasterize](#jbrowserasterize)
		- [Usage](#usage)
			- [HTTP-BASIC authentication](#http-basic-authentication)
		- [Tested track types](#tested-track-types)
		- [Known issues](#known-issues)
- [Additional developer details](#additional-developer-details)
	- [Editing README.md](#editing-readmemd)
	- [Javascript Style](#javascript-style)
	- [Version number](#version-number)
- [LICENCE](#licence)

<!-- /TOC -->

## Installation

Requires a working installation of `node` and `npm`.

Installation of `cgpJBrowseToolkit` can be achieved a number of ways but the
simplest is:

```
npm install github:cancerit/cgpJBrowseToolkit [-g]
```

Dependencies include:

* [commander](https://www.npmjs.com/package/commander)
* [puppeteer](https://www.npmjs.com/package/puppeteer)
* [mkdirp](https://www.npmjs.com/package/mkdirp)

## Tools

If you are having difficulty please check the linked [wiki][gh-wiki] before raising an [issue][gh-issues].

### jbrowse_rasterize

Generate screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

#### Usage

```
  $ js/jbrowse_rasterize.js --help
  Usage: jbrowse_rasterize [options]

  Generate images against a JBrowse server

  Options:

    -l, --locs <file>        Bed file of locations, see --help
    -b, --baseUrl [value]    URL from pre configured JBrowse webpage, ommit if provided in BED file
    -w, --width [n]          Width of image (default: 600)
    -i, --imgType [value]    Type of image [jpeg|pdf|png] (default: png)
    -o, --outdir [value]     Output folder (default: ./)
    -n, --navOff             Remove nav bars
    -d, --dMode [value]      Change default display of alignment tracks [normal|compact|collapsed]
        --highlight          Highlight region (for short events)
    -q, --quality [n]        Image resolution [1,2,3] (default: 3)
    -z, --zoom [n]           Zoom factor (default: 1)
    -p, --passwdFile [file]  User password for httpBasic
    -t, --timeout [n]        For each track allow upto N sec. (default: 10)
    -v, --version            output the version number
    -h, --help               output usage information

  Additional information:

  Image quality:
    Best image quality is achieved with pdf, but ~5x larger than png.

  Zoom:
    To alow capturing same region in a wider image as JBrowse has a minimum width per base.


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
```

Usage is simple, set up the display with relevant tracks in the browser and provide the updated URL it to the script:

```
  $ jbrowse_rasterize.js \
  --width 1200 \
  --imgType png \
  --locs test/volvox.bed \
  --outdir somewhere \
  --baseUrl 'http://jbrowse.org/code/JBrowse-1.12.4/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
```

##### HTTP-BASIC authentication
-------------------------
To use this with a site secured with http_basic you need to provide your password for the
authentication phase.

Please **set permissions accordingly**, don't expose your password on a network drive.

Other:

* Sites not requiring auth load silently.
* If not provided when required you will see the message `ERROR: Check you connection and if you need to provide a password (http error code: 401)`

#### Tested track types
------------------
All testing carried out under JBrowse 1.12.4 onwards.

Functionality of the following tracks has been tested:

* Alignments2
* VCF
* XYplot
* CanvasFeatures
* Sequence

#### Known issues

* [multibigwig](https://github.com/elsiklab/multibigwig) - plugin track will only render with v0.7.0+

Please report any problems with other track types on the [GitHub issue tracker][gh-issues]

## Additional developer details

### Editing README.md

Please ensure the TOC is kept up to date.  If using atom installing the `markdown-toc` package
will ensure this is automatically updated.

### Javascript Style

To check the vailidity of the JS files with `eslint`, install with:

```bash
npm install eslint
```

Validate with:

```bash
eslint js/*.js
```

### Version number

The version is found in `js/version.js` and `package.json` and should be kept in sync.

## LICENCE

```
Copyright (c) 2016-2018 Genome Research Ltd.

Author: CASM/Cancer IT <cgphelp@sanger.ac.uk>

This file is part of cgpJBrowseToolkit.

cgpJBrowseToolkit is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation; either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

1. The usage of a range of years within a copyright statement contained within
this distribution should be interpreted as being equivalent to a list of years
including the first and last year specified and all consecutive years between
them. For example, a copyright statement that reads ‘Copyright (c) 2005, 2007-
2009, 2011-2012’ should be interpreted as being identical to a statement that
reads ‘Copyright (c) 2005, 2007, 2008, 2009, 2011, 2012’ and a copyright
statement that reads ‘Copyright (c) 2005-2012’ should be interpreted as being
identical to a statement that reads ‘Copyright (c) 2005, 2006, 2007, 2008,
2009, 2010, 2011, 2012’."
```

<!-- refs -->
[jbrowse]: http://jbrowse.org
[gh-issues]:https://github.com/cancerit/cgpJBrowseToolkit/issues
[gh-wiki]: https://github.com/cancerit/cgpJBrowseToolkit/wiki

<!-- travis -->
[travis-base]: https://travis-ci.org/cancerit/cgpJBrowseToolkit
[travis-master]: https://travis-ci.org/cancerit/cgpJBrowseToolkit.svg?branch=master
[travis-develop]: https://travis-ci.org/cancerit/cgpJBrowseToolkit.svg?branch=develop
