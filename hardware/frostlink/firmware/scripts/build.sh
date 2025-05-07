#!/bin/bash

SCRIPT=$(realpath $0)
SCRIPTPATH=$(dirname $SCRIPT)

docker run --rm \
  -v $SCRIPTPATH/../src:/src -w /src \
  espressif/idf:release-v5.4 idf.py build
