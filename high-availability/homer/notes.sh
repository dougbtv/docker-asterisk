#!/bin/bash
docker kill mysql
docker rm mysql
docker run --name mysql \
  -v /tmp/mysql:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -p 3306:3306 \
  -d mysql

# docker run -it -p 9060:9060/udp --link mysql:mysql dougbtv/homer-kamailio
