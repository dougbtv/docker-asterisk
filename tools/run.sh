#!/bin/bash
BOX_NAME=asterisk

# For testing use:
# docker run --name $BOX_NAME --net=host -i -t dougbtv/asterisk bin/bash

docker run --name $BOX_NAME --net=host -d -t dougbtv/asterisk