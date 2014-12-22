#!/bin/bash

# Mysql --------------------------------
docker kill mysql
docker rm mysql
docker run --name mysql \
  -v /tmp/mysql:/var/lib/mysql \
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
  -d dougbtv/homer-kamailio

# Capture Agent ------------------------
docker kill captagent
docker rm captagent
docker run \
  --net=host \
  --name captagent \
  -d dougbtv/captagent \
  -d wlp3s0 -h 172.17.42.1 -p 9060 -i 2001

# woooot
# docker run -p 80:80 --link mysql:mysql -it dougbtv/homer /bin/bash