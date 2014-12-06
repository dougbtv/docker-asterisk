#!/bin/bash

IP_ADDR="192.168.100.1"
# $(ifconfig | grep -i 192.168.100 | awk '{print $2}')

docker run --rm -it \
    -p 4001:4001 -p 7001:7001 \
    -v /var/etcd/:/data \
    -i -t coreos/etcd:latest \
    -discovery=https://discovery.etcd.io/84b1b674bc96081e8060de7289feb5a8 \
    -peer-addr $IP_ADDR:7001 \
    -addr $IP_ADDR:4001 \
    -name etcdindocker1234

