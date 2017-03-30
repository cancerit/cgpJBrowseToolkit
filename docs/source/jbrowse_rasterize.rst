jbrowse_rasterize.js
====================

Generate screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

************
Requirements
************

Requires a working installation of `casperjs <http://casperjs.org/>`_ and `phantomjs <http://phantomjs.org/>`_.

************************************
Benefits over phantomjs rasterize.js
************************************

The advantages of this over looping on the standard phantomjs rasterize.js are:

* Cache of data is maintained.
* Also works with sites secured with http_basic (see :ref:`http-basic-authentication`).
* Trims images back to correct height (except pdf).
* Attempts to automatically compensate for track loading times based on requested base URL.
* Hides tracklist automatically.

*****
Usage
*****

*All arguments require* ``--`` *prefix.*

Usage is simple, set up the display with relevant tracks in the browser and provide the updated URL it to the script::

  $ casperjs jbrowse_rasterize.js \
  --width=1200 \
  --imgType=png \
  --locs=places.bed \
  --outdir=wibble1 \
  --baseUrl='http://localhost:8999/JBrowse/?data=auto%2F1404&loc=1%3A115102801..115404000&tracks=...'

.. table:: Command line args

   ==========   ========  ================  ===================================================
   Argument     Required  Type/Values       Description
   ==========   ========  ================  ===================================================
   width        Yes       integer           Width in pixels for generated image.
   imgType      Yes       ``pdf|jpeg|pdf``  Type of image to generate.
   height       No        integer           Height in pixels, required for ``--imgType=pdf`` or
                                            if generated images may exceed 2000px.
   locs         Yes       ``*.bed``         Bed file of locations to snapshot, not bgzip'ed.
   outdir       Yes       path              Prexisting output folder.
   passwdFile   No        path              Path to file containing password (**please secure**).
   baseUrl      Yes       URL               JBrowse URL to base all snapshots on.
   navOff       No        N/A               Presence causes the navigation panel to be excluded
                                            from image.
   v            No        N/A               Output version of script and exit when found.
   ==========   ========  ================  ===================================================

.. _http-basic-authentication:

HTTP-BASIC authentication
-------------------------
To use this with a site secured with http_basic you need to provide your password for the
authentication phase.  To do this under casperjs it's being read from a file (if you know
of a better way please get in touch).


Please **set permissions accordingly**, don't expose your password on a network drive.

Other:

* Sites not requiring auth load silently.
* If not provided when required you will see an error like: ``[warning] [phantom] Loading resource failed with status=fail (HTTP 401): ...``.

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
At present doesn't process the `multibigwig <https://github.com/elsiklab/multibigwig>`_ plugin track correctly.
The ``loading`` divs clear when the canvas is added but even with extended timeout (far more than time taken in browser)
I can't get the multiple layers of the canvas to render, only the scale.

Please report any problems with other track types on the `GitHub issue tracker <https://github.com/cancerit/cgpJBrowseToolkit/issues>`_
