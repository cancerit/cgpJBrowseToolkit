Installation
============

Requires a working installation of ``node`` with the following npm modules:

* `commander <https://www.npmjs.com/package/commander>`_
* `puppeteer <https://www.npmjs.com/package/puppeteer>`_
* `mkdirp <https://www.npmjs.com/package/mkdirp>`_

```
npm install commander puppeteer mkdirp
```

Installation of ``jbrowse_rasterize`` can be achieved a number of ways but the
simplest is::

  export VERSION=master # or version number, e.g. 1.1.0
  export JBTK=https://raw.githubusercontent.com/cancerit/cgpJBrowseToolkit
  curl -sSL  $JBTK/$VERSION/js/jbrowse_rasterize.js> $HOME/local/bin/jbrowse_rasterize.js
  chmod u+x $HOME/local/bin/jbrowse_rasterize.js
