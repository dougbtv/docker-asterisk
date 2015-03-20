#!/bin/bash

IP_ADDR="192.168.100.1"
# $(ifconfig | grep -i 192.168.100 | awk '{print $2}')

docker run --rm -it \
    -p 4001:4001 -p 7001:7001 \
    -v /var/etcd/:/data \
    -i -t coreos/etcd:latest \
    -discovery=https://discovery.etcd.io/91d3fd52932813bef18b0db71f50457e \
    -peer-addr $IP_ADDR:7001 \
    -addr $IP_ADDR:4001 \
    -name etcdindocker1234

