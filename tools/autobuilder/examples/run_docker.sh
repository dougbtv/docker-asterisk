#!/bin/bash
# It likes to complain about the port if you don't restart it.
echo "Restarting docker..."
systemctl restart docker
# Make sure everything else is clear.
echo "Kill all containers"
docker kill $(docker ps -a -q)
echo "Removing all containers"
docker rm $(docker ps -a -q)

# Start the recurive matrix of oddity.
echo "Starting docker-in-docker..."
docker run \
  --privileged \
  --name dind \
  -d -p 4444:4444 \
  -e PORT=4444 \
  -t jpetazzo/dind:latest
echo "Starting autobuilder..."

docker run \
  --name autobuilder \
  --link dind:dind \
  -t dougbtv/asterisk-autobuilder \
  forever -e /var/log/autobuilder.log -o /var/log/autobuilder.log autobuilder.js \
    -u asteriskautobuilder -p "aaaaaaaaaaaaaaaaa" \
    --docker_user dougbtv --docker_password "aaaaaaaaaaaaaa" --docker_email "d00d@d00d.com" \
    --skipclone --irc_debug --irc_disabled --forceupdate --authdisabled
