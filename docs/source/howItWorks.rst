How jbrowse_rasterize works
===========================

The ability to take screenshots in JBrowse is made diffcult by there being no true end-point to the
generation of a view.  All actions are asynchronous with no single testable variable or element.

``jbrowse_rasterize`` attempts to compensate for this by testing several critical elements of the DOM::

  document.readyState === "complete" &&
  document.getElementsByClassName('innerTrackContainer')[0].getElementsByClassName('track').length === trackCount+1 &&
  document.getElementsByClassName('loading').length === 0

``trackCount`` needs ``+1`` to account for the grid background track.
