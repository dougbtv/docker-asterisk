#!/bin/bash

# Give everything meaningful names
NAME_ASTERISK=asterisk
NAME_FASTAGI=fastagi

# Do some cleanup.
echo "Kill all containers"
docker kill $(docker ps -a -q)
echo "Removing all containers"
docker rm $(docker ps -a -q)

# Now let's actually run the containers.

docker run --name $NAME_ASTERISK --net=host -d -t dougbtv/asterisk

# For testing use:
# docker run --name $NAME_ASTERISK --net=host -i -t dougbtv/asterisk bin/bash

exit 0;

# The rest is for later use... I'm testing still.

docker run \
    --name $NAME_FASTAGI \
    -h $NAME_FASTAGI \
    -d -t dougbtv/fastagi

docker run \
    --link $NAME_FASTAGI:fastagi \
    --name $NAME_ASTERISK \
    --net=host \
    -i -t dougbtv/asterisk bin/bash


# --volumes-from $NAME_API