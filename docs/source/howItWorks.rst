How jbrowse_rasterize works
===========================

``jbrowse_rasterize`` now uses `Puppeteer <https://github.com/GoogleChrome/puppeteer>`_ which allows
testing for network activity to cease before indicating a page has completed rendering.

There is no longer a guess as to how long it will take for elements to have completed drawing as 

************
Prior to 2.0
************

The ability to take screenshots in JBrowse is made diffcult by there being no true end-point to the
generation of a view.  All actions are asynchronous with no single testable variable or element.

``jbrowse_rasterize`` attempted to compensate for this by testing several critical elements of the DOM::

  document.readyState === "complete" &&
  document.getElementsByClassName('innerTrackContainer')[0].getElementsByClassName('track').length === trackCount+1 &&
  document.getElementsByClassName('loading').length === 0

``trackCount`` needs ``+1`` to account for the grid background track.
