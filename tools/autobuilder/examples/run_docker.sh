#!/bin/bash
echo "Kill all containers"
docker kill $(docker ps -a -q)
echo "Removing all containers"
docker rm $(docker ps -a -q)
echo "Starting docker-in-docker..."
docker run \
  --privileged \
  --name dind \
  -d -p 4444 \
  -e PORT=4444 \
  -t jpetazzo/dind:latest
echo "Starting autobuilder..."
