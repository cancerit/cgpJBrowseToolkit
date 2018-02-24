#!/bin/bash

set -ue
JBROWSE_TAG_OR_BRANCH="1.12.4-release"

if [ ! -d jbrowse ]; then
  git clone --depth 1 https://github.com/GMOD/jbrowse.git -b ${JBROWSE_TAG_OR_BRANCH}
  cd jbrowse
  npm install
  ./jb_setup.js
fi
