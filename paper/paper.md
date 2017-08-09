---
title: 'cgpJBrowseToolkit - tools and scripts for working with JBrowse'
tags:
  - JBrowse
  - rasterize
  - visualisation
authors:
 - name: Keiran M Raine
   orcid: 0000-0002-5634-1539
   affiliation: 1
affiliations:
 - name: Cancer, Ageing and Somatic Mutation, Wellcome Trust Sanger Institute, Cambridge, UK
   index: 1
date: 23 July
bibliography: paper.bib
---

# Summary

This project is provides scripts and tools which work with or on JBrowse [@jbrowse] that
are considered publicly useful.

Currently there is only a single tool `jbrowse_rasterize.js` which is used to
generate sets of images from a JBrowse instance using CasperJS [@casperjs] and PhantomJS [@phantomjs].

The intent for this was to replace the 'screen-shot' functionality of GBrowse [@gbrowse]
where it was possible to script large sets of image generation using `curl` and
automated URL generation.  JBrowse itself doesn't directly support screenshots
and there are many interface elements that detract from a clean publication quality
image as well as the limitation of only being able to capture the viewable area.

`jbrowse_rasterize` dynamically handles the image height (except PDF) and provides
command line options to hide navigation sections.  Usage is simple, see [jbrowse_rasterize#usage](http://cgpjbrowsetoolkit.readthedocs.io/en/stable/jbrowse_rasterize.html#usage)

-![Example of jbrowse_rasterize output](jb_noNav.png)

Full documentation is provided via Read the Docs [@rtd] [here]([jbrowse_rasterize#usage](http://cgpjbrowsetoolkit.readthedocs.io/en/stable/)).

# References
