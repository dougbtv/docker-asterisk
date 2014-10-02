#!/bin/bash
BOX_NAME=asterisk
docker run --name $BOX_NAME --net=host -i -t asterisk/base bin/bash