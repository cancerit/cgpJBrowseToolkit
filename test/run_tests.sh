#!/bin/bash

function killserver {
  ps -f | grep -F 'jb_run.js -p 8080' | grep -v grep | awk '{print $2;}' | xargs kill
}

function ehandle {
  R=$1
  if [ $R -ne 0 ]; then
    echo "ERRORS occurred: $R"
    rm -rf imgTest
    killserver
    exit $R
  fi
}

SCRIPT_PATH=`dirname $0`;
SCRIPT_PATH=`(cd $SCRIPT_PATH && pwd)`

cd $SCRIPT_PATH
./local_server.sh

cd $SCRIPT_PATH/jbrowse
./jb_run.js -p 8080 &
sleep 3
cd $SCRIPT_PATH/..

node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l imgTest/ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --imgType jpeg --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l imgTest/ctgA_17174-23150.jpeg
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox_urlEmbedded.bed --navOff
ehandle $?
ls -l imgTest/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf
ehandle $?
ls -l imgTest/EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf --zoom 2
ehandle $?
ls -l imgTest/EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox_urlEmbedded.bed --navOff --imgType png --zoom 2
ehandle $?
ls -l imgTest/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --outdir imgTest --locs test/volvox_urlEmbedded.bed --navOff --imgType png --dMode compact
ehandle $?
ls -l imgTest/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?

rm -rf imgTest

killserver

exit 0
