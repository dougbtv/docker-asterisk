#!/bin/bash

IP_ADDRESS=$(ifconfig | grep -A 1 p4p1 | tail -n 1 | awk '{print $2}')

docker run \
    --volumes-from kamailio \
    -i -t dougbtv/dispatch-watcher \
    --etcdhost $IP_ADDRESS