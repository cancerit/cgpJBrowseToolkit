#!/bin/bash

function ehandle {
  R=$1
  if [ $R -ne 0 ]; then
    echo "ERRORS occurred: $R"
    ps -fu $USER | grep -F 'http-server' | grep -v grep | awk '{print $2;}' | xargs kill
    exit $R
  fi
}

SCRIPT_PATH=`dirname $0`;
SCRIPT_PATH=`(cd $SCRIPT_PATH && pwd)`
cd $SCRIPT_PATH/../jbrowse
http-server -p 8080 -s . &
cd $SCRIPT_PATH/..

EXIT_SUM=0

js/jbrowse_rasterize.js --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l ctgA_17174-23150.png
ehandle $?
js/jbrowse_rasterize.js --imgType jpeg --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l ctgA_17174-23150.jpeg
ehandle $?
js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff
ehandle $?
ls -l EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf
ehandle $?
ls -l EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf --zoom 2 --outdir z2
ehandle $?
ls -l z2/EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType png --zoom 2 --outdir z2
ehandle $?
ls -l z2/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType png --outdir compact --dMode compact
ehandle $?
ls -l compact/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?

ps -fu $USER | grep -F 'http-server' | grep -v grep | awk '{print $2;}' | xargs kill
