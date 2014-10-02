#!/bin/bash
echo "Kill all containers"
docker kill $(docker ps -a -q)
echo "Removing all containers"
docker rm $(docker ps -a -q)
echo "Restarting docker service"
systemctl restart docker

