# Changes

## 2.2.0

* Warn and change file permissions if password file has permissive access.
  * Display warning when Windows as can't do it.

## 2.1.1

* Missing package in dependencies
* `--throw-deprecations` can't be in `#!` line for linux
  * Added programatic handling

## 2.1.0

* Formalise to allow install via `npm`.
* Remove RTD, large overhead when README and linked docs are adequate.
* Updated email and group name in license and docs.

## 2.0.0

* Switched to [puppeteer](https://github.com/GoogleChrome/puppeteer).
  * Lost bmp support.
* Height param no longer needed.
* Utilise 'highres' option of JBrowse via `--quality` param.
* Added ability to extend timeout.
* Added `--highlight` option.
* baseUrl can be defined inline within locs bed file to change during execution.
* Can force alignments2 tracks to different display mode.
* Zoom available for small b.p. ranges
* Ability to use multiple baseUrls via bed file comments added.

## 1.1.1

* Update RTD entry to indicate multibigwig has been fixed.
* Add sphinx rtd build to travis-ci.
* Correct typo in usage.

## 1.1.0

* Makes jbrowse_rasterize.js executable
* Corrections to build badges
* Cleaned up RTD pages

## 1.0.0

* Monitors the track divs to confirm track loading/rendering is complete.
* Adds option to turn off the navigation elements.
* Automatically disables the `tracklist` and `fullviewlink` elements.
* Tested with JBrowse 1.12.3 rc1
  * Alignments2, VCF, XYplot, CanvasFeatures and Sequence view all appear to honor the load complete tests.
  * [multibigwig](https://github.com/elsiklab/multibigwig) seems to have some issue which needs tracking down.
* Added ReadTheDocs integration.

## 0.1.0

Initial release of base project
