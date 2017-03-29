cgpJBrowseToolkit
=================

| Master | Dev |
|---|---|
|  [![Build Status](https://travis-ci.org/cancerit/cgpJBrowseToolkit.svg?branch=master)](https://travis-ci.org/cancerit/cgpJBrowseToolkit) | [![Build Status](https://travis-ci.org/cancerit/cgpJBrowseToolkit.svg?branch=develop)](https://travis-ci.org/cancerit/cgpJBrowseToolkit) |

Contains various scripts and tools that work with or on [JBrowse](http://jbrowse.org/) that are publicly useful.

## jbrowse_rasterize.js

Generate screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

Requires a working installation of [casperjs](http://casperjs.org/).

The advantages of this over looping on the standard phantomjs rasterize.js are:

* Cache of data is maintained.
* Also works with sites secured with http_basic:
  * Password in text file - __Set permissions accordingly__.
  * Sites not requiring auth load silently.
  * If not provided when required you will see an error like: `[warning] [phantom] Loading resource failed with status=fail (HTTP 401): ...`.
* Trims images back to correct height (except pdf).
* Attempts to automatically compensate for track loading times based on requested base URL.
* Hides tracklist automatically.

Usage is simple, get the user to set up the display with relevant tracks in the browser and then just copy the URL and give it to the script:

```
$ casperjs jbrowse_rasterize.js \
--width=1200 \
--imgType=png \
--locs=places.bed \
--outdir=wibble1 \
--baseUrl='http://localhost:8999/JBrowse/?data=auto%2F1404&loc=1%3A115102801..115404000&tracks=...' \
```

At present doesn't process the [multibigwig](https://github.com/elsiklab/multibigwig) plugin track correctly.  Please report issues with other track types if found.

Functionality of the following tracks has been tested:
* Alignments2
* VCF
* XYplot
* CanvasFeatures
* Sequence

All testing carried out under JBrowse 1.12.3 rc1.
