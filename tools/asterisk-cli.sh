#!/bin/bash
# thanks to this guy: https://coderwall.com/p/xwbraq
# @dougbtv just modded to awk out the asterisk name.
sudo nsenter -t $(docker inspect --format '{{ .State.Pid }}' $(docker ps | grep -i asterisk | awk '{print $1}')) -m -u -i -n -p -w
