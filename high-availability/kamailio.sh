#!/bin/bash
docker kill kamailio
docker rm kamailio

docker run \
    --name kamailio \
    -p 5060:5060/udp \
    -v /etc/kamailio \
    -i -t dougbtv/kamailio

#    -v $(pwd)/kamailio.cfg:/etc/kamailio/kamailio.cfg \
