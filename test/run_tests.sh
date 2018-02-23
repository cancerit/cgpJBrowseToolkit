#!/bin/bash

function killserver {
  ps -f | grep -F 'jb_run.js -p 8080' | grep -v grep | awk '{print $2;}' | xargs kill
}

function ehandle {
  R=$1
  if [ $R -ne 0 ]; then
    echo "ERRORS occurred: $R"
    killserver
    exit $R
  fi
}

SCRIPT_PATH=`dirname $0`;
SCRIPT_PATH=`(cd $SCRIPT_PATH && pwd)`

cd $SCRIPT_PATH
./local_server.sh

cd $SCRIPT_PATH/../jbrowse
nohup ./jb_run.js -p 8080 &
sleep 3
cd $SCRIPT_PATH/..

node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --imgType jpeg --locs test/volvox.bed --navOff --baseUrl 'http://0.0.0.0:8080/?tracks=DNA%2CTranscript%2Cvolvox-sorted_bam_coverage%2Cvolvox-sorted_bam&data=sample_data%2Fjson%2Fvolvox'
ehandle $?
ls -l ctgA_17174-23150.jpeg
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff
ehandle $?
ls -l EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf
ehandle $?
ls -l EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType pdf --zoom 2 --outdir z2
ehandle $?
ls -l z2/EmbeddedUrl/ctgA_17174-23150.pdf
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType png --zoom 2 --outdir z2
ehandle $?
ls -l z2/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?
node --throw-deprecation js/jbrowse_rasterize.js --locs test/volvox_urlEmbedded.bed --navOff --imgType png --outdir compact --dMode compact
ehandle $?
ls -l compact/EmbeddedUrl/ctgA_17174-23150.png
ehandle $?

killserver

exit 0
