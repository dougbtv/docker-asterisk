#!/bin/bash

ETHERNET_DEVICE=p4p1

# Mysql --------------------------------
docker kill mysql
docker rm mysql
docker run --name mysql \
  -v /tmp/mysql:/var/lib/mysql \
  -v /etc/localtime:/etc/localtime \
  -e MYSQL_ROOT_PASSWORD=secret \
  -p 3306:3306 \
  -d mysql

# Capture Server -----------------------
docker kill captureserver
docker rm captureserver
docker run \
  --name captureserver \
  -p 9060:9060/udp \
  --link mysql:mysql \
  -d dougbtv/homer-captureserver

# Capture Agent ------------------------
docker kill captagent
docker rm captagent
docker run \
  --net=host \
  --name captagent \
  -d dougbtv/homer-captagent \
  -d $ETHERNET_DEVICE -h 172.17.42.1 -p 9060 -i 2001

# woooot
docker kill homer
docker rm homer
docker run \
  -p 80:80 \
  --name homer \
  --link mysql:mysql \
  -dt dougbtv/homer-webapp