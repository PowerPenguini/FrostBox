#!/bin/bash

SCRIPT=$(realpath $0)
SCRIPTPATH=$(dirname $SCRIPT)

docker run --rm \
  -v $SCRIPTPATH/../src:/src -w /src \
  --device /dev/ttyUSB0 \
  espressif/idf:release-v5.4 idf.py flash -p /dev/ttyUSB0
