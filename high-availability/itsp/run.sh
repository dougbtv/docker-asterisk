#!/bin/bash
docker kill asterisk
docker rm asterisk
docker run \
  -v /home/doug/codebase/docker-asterisk/high-availability/itsp/sip.conf:/etc/asterisk/sip.conf \
  --name asterisk \
  --net=host -d -t dougbtv/asterisk
