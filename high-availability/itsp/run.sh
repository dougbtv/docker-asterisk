#!/bin/bash
INDIR=$(pwd)
CONTAINER_NAME=asterisk

docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker run \
  -v $INDIR/extensions.conf:/etc/asterisk/extensions.conf \
  -v $INDIR/sip.conf:/etc/asterisk/sip.conf \
  --name $CONTAINER_NAME \
  --net=host -d -t dougbtv/asterisk
