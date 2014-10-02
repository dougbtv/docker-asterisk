#!/bin/bash
sudo nsenter -t $(docker inspect --format '{{ .State.Pid }}' $(docker ps | grep -i asterisk)) -m -u -i -n -p -w
