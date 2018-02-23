#!/bin/bash

set -uxe
JBROWSE_VER=1.12.4

if [ ! -d jbrowse ]; then
  git clone --depth 1 https://github.com/GMOD/jbrowse.git -b ${JBROWSE_VER}-release
  cd jbrowse
  npm install
  ./jb_setup.js
  cd ..
fi
cd jbrowse
http-server -p 8080 -s .
