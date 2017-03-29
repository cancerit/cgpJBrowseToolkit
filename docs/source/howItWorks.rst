How jbrowse_rasterize works
===========================

The ability to take screenshots in JBrowse is made diffcult by there being no true end-point to the
generation of a view.  All actions are asynchronous with no single testable variable or element.

``jbrowse_rasterize`` attempts to compensate for this by testing several critical elements of the DOM.

1. ``document.readyState === "complete"``
2. ``document.getElementsByClassName('innerTrackContainer').length === 1``
3. ``document.getElementsByClassName('innerTrackContainer')[0].getElementsByClassName('track').length > 1``
4. ``document.getElementsByClassName('loading').length === 0``

Technically item **3** should be equal to ``trackCount+1`` as there is one div with the class ``track``
per requested track plus the ``grid`` background track (note: if you request 0 tracks the ref-seq is
automatically added).  I've found that this never completes if set to the expected value (even though
it does in the Chrome console).
