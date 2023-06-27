# cgpJBrowseToolkit

Contains the script 'jbrowse_rasterize.js', a script to generate images from JBrowse.

* [Installation](#installation)
* [Installation with Docker](#installation-with-docker)
* [Usage](#usage)
* [LICENCE](#licence)

## Installation

Requires a working installation of `node` and `npm`. Depending on your operating system, you may also need to install additional pacakages for running chromium. For an out-of-the-box installation, please see [installation with Docker](#installation-with-docker).

```
git clone https://github.com/cancerit/cgpJBrowseToolkit.git;
npm install .;
```

## Installation with Docker

For conveniance, a Dockerfile is provided to build an image with all necessary requirements installed.

``` 
git clone https://github.com/cancerit/cgpJBrowseToolkit.git;
cd cgpJBrowseToolkit.git;
docker build --tag cgpjbrowsetoolkit:develop;
```

## Usage

jbrowse_rasterize.js generates screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

```
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
-p, --passwdFile [file]  User username and password password for httpBasic
-t, --timeout [n]        For each track allow upto N sec. (default: 10)
-v, --version            output the version number
-h, --help               output usage information

Additional information:

Image quality:
Best image quality is achieved with pdf, but ~5x larger than png.

Zoom:
To allow capturing same region in a wider image as JBrowse has a maximum width per base.


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
```

### Example: Running with 'baseUrl' option

volvox.bed:

```
ctgA	17173	23150
```

```bash
mkdir -p out;
node js/jbrowse_rasterize.js \
	--imgType png \
	--locs volvox.bed \
	--outdir out \
	--baseUrl 'http://jbrowse.org/code/JBrowse-1.12.4/?tracks=Transcript%2Cvolvox-sorted_bam_coverage&data=sample_data%2Fjson%2Fvolvox';
```

### Example: Running with embedded URL

volvox_urlEmbedded.bed:

```
# EmbeddedUrl http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox
ctgA	17173	23150
```

```bash
mkdir -p out;
node js/jbrowse_rasterize.js \
	--imgType png \
	--locs volvox_urlEmbedded.bed \
	--outdir out
```

### Example: Running with Docker

See [installation with Docker](#installation-with-docker).

```bash
mkdir -p out;
docker run \
	--rm \
	-v ${PWD}:/home/ubuntu \
	--user $(id -u):$(id -g) \
	cgpjbrowsetoolkit:develop \
	node jbrowse_rasterize.js \
		--imgType png \
		--locs volvox_urlEmbedded.bed \
		--outdir out
```

### HTTP-BASIC Authentication

To use this with a site secured with http_basic (username and password) you will need to provide this in a file whos path is set with the `--passwdFile` option.

eg. pass.txt

```
username
password
```

Please **set permissions accordingly** for this file and preferably delete it after use.

## LICENCE

```
Copyright (c) 2016-2023 Genome Research Ltd.

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
