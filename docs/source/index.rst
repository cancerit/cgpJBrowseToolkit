.. cgpJBrowseToolkit documentation master file, created by
   sphinx-quickstart on Wed Mar 29 14:57:01 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to cgpJBrowseToolkit's documentation!
=============================================

.. image:: https://travis-ci.org/cancerit/cgpJBrowseToolkit.svg?branch=master
   :target: https://travis-ci.org/cancerit/cgpJBrowseToolkit
   :alt: Build Status

.. image:: https://readthedocs.org/projects/cgpjbrowsetoolkit/badge/?version=latest
   :target: http://cgpjbrowsetoolkit.readthedocs.io/en/latest/?badge=latest
   :alt: Documentation Status

Contains various scripts and tools that work with or on `JBrowse <http://jbrowse.org/>`_ that are publicly useful.

********************
jbrowse_rasterize.js
********************

Generate screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

Requires a working installation of `casperjs <http://casperjs.org/>`_.

The advantages of this over looping on the standard phantomjs rasterize.js are:

* Cache of data is maintained.
* Also works with sites secured with http_basic:

  * Password in text file - **Set permissions accordingly**.
  * Sites not requiring auth load silently.
  * If not provided when required you will see an error like: ``[warning] [phantom] Loading resource failed with status=fail (HTTP 401): ...``.

* Trims images back to correct height (except pdf).
* Attempts to automatically compensate for track loading times based on requested base URL.
* Hides tracklist automatically.

Usage is simple, set up the display with relevant tracks in the browser and provide the updated URL it to the script::

  $ casperjs jbrowse_rasterize.js \
  --width=1200 \
  --imgType=png \
  --locs=places.bed \
  --outdir=wibble1 \
  --baseUrl='http://localhost:8999/JBrowse/?data=auto%2F1404&loc=1%3A115102801..115404000&tracks=...'

=========   ========  ============  ===============================================================
Argument    Required  Type/Values   Description
=========   ========  ============  ===============================================================
width       Yes       integer       Width in pixels for generated image.
imgType     Yes       pdf|jpeg|pdf  Type of image to generate.
pdfHeight   No        integer       Height in pixels, required for ``--imgType=pdf``.
locs        Yes       *.bed         Bed file of locations to snapshot, not bgzip'ed.
outdir      Yes       path          Prexisting output folder.
baseUrl     Yes       URL           JBrowse URL to base all snapshots on.
navOff      No        N/A           Presence causes the navigation panel to be excluded from image.
=========   ========  ============  ===============================================================

Tested track types
------------------
All testing carried out under JBrowse 1.12.3 rc1.

Functionality of the following tracks has been tested:

* Alignments2
* VCF
* XYplot
* CanvasFeatures
* Sequence

Known issues
------------
At present doesn't process the `multibigwig <https://github.com/elsiklab/multibigwig>`_ plugin track correctly.  Please report issues with other track types if found.

License
-------

The project is licensed under the `GNU Affero General Public License v3.0 license <https://github.com/cancerit/cgpJBrowseToolkit/blob/develop/LICENSE>`_.
