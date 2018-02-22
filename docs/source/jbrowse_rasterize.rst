jbrowse_rasterize.js
====================

Generate screenshots from your JBrowse instance using the URL and a BED file of locations of interest.

************************************
Benefits over phantomjs rasterize.js
************************************

The advantages of this over looping on the standard phantomjs rasterize.js are:

* Cache of data is maintained.
* Also works with sites secured with http_basic (see :ref:`http-basic-authentication`).
* Trims/expands images to correct height.
* Handles variable track loading time by monitoring network activity/
* Hides tracklist automatically.

*****
Usage
*****

See command line help for most current options::

  $ js/jbrowse_rasterize.js --help

  Usage: jbrowse_rasterize [options]


  Options:

    -b, --baseUrl <value>    URL from pre configured JBrowse webpage
    -l, --locs <value>       Bed file of locations
    -w, --width [n]          Width of image (default: 600)
    -i, --imgType [value]    Type of image (jpeg|png) (default: png)
    -o, --outdir [value]     Output folder (default: ./)
    -n, --navOff             Remove nav bars
        --highlight          Highlight region (for short events)
    -p, --passwdFile [file]  User password for httpBasic
    -t, --timeout [n]        For each track allow upto N sec. (default: 10)
    -v, --version            output the version number
    -h, --help               output usage information

Usage is simple, set up the display with relevant tracks in the browser and provide the updated URL it to the script::

  $ jbrowse_rasterize.js \
  --width 1200 \
  --imgType png \
  --locs test/volvox.bed \
  --outdir wibble1 \
  --baseUrl 'http://jbrowse.org/code/JBrowse-1.12.4/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'

.. table:: Command line args

   ==========   ========  ================  ===================================================
   Argument     Required  Type/Values       Description
   ==========   ========  ================  ===================================================
   baseUrl      Yes       URL               JBrowse URL to base all snapshots on.
   locs         Yes       ``*.bed``         Bed file of locations to snapshot, not bgzip'ed.
   width        Yes       integer           Width in pixels for generated image.
   imgType      Yes       ``pdf|jpeg``      Type of image to generate.
   outdir       Yes       path              Prexisting output folder.
   navOff       No        N/A               Presence causes the navigation panel to be excluded.
   highlight    No        N/A               Highlights the targeted range, for use with short
                                            events where JBrowse pads image.
   passwdFile   No        path              Path to file containing password (**please secure**).
   timeout      No        integer           Extends the default MAX timeout per track.
   version      No        N/A               Output version of script and exit when found.
   help         No        N/A               Prints help text.
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
* If not provided when required you will see the message::
  ERROR: Check you connection and if you need to provide a password (http error code: 401)

Tested track types
------------------
All testing carried out under JBrowse 1.12.3 rc1 onwards.

Functionality of the following tracks has been tested:

* Alignments2
* VCF
* XYplot
* CanvasFeatures
* Sequence

Known issues
------------
* `multibigwig <https://github.com/elsiklab/multibigwig>`_ - plugin track will only render with v0.7.0+

Please report any problems with other track types on the `GitHub issue tracker <https://github.com/cancerit/cgpJBrowseToolkit/issues>`_
