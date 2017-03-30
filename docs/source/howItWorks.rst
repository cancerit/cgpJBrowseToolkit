How jbrowse_rasterize works
===========================

The ability to take screenshots in JBrowse is made diffcult by there being no true end-point to the
generation of a view.  All actions are asynchronous with no single testable variable or element.

``jbrowse_rasterize`` attempts to compensate for this by testing several critical elements of the DOM.

1. ``document.readyState === "complete"``
2. ``document.getElementsByClassName('innerTrackContainer').length === 1``
3. ``document.getElementsByClassName('innerTrackContainer')[0]\``
   ``.getElementsByClassName('track').length === trackCount+1``
4. ``document.getElementsByClassName('loading').length === 0``

Item **3** needs the ``+1`` to account for the ``grid`` background track.
