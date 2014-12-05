#!/bin/bash

IP_ADDR="192.168.122.1"
# $(ifconfig | grep -i 192.168.100 | awk '{print $2}')

docker run --rm -it \
    -p 4001:4001 -p 7001:7001 \
    -v /var/etcd/:/data \
    -i -t coreos/etcd:latest \
    -discovery=https://discovery.etcd.io/a9183c3c0f556f37bb9f10de85086fcc \
    -peer-addr $IP_ADDR:7001 \
    -addr $IP_ADDR:4001 \
    -name etcdindocker1234

# -i -t microbox/etcd:latest \


# docker run -p 4001:4001 coreos/etcd:v0.4.6 -name myetcd -discovery=https://discovery.etcd.io/c3176e9f6f49612ccc6bcd6fd8081682

