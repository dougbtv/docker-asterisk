#!/bin/bash

# Using syslog for now? 
# ...don't later.
service rsyslog start

# This reloads dispatcher when the list is changed.
/dispatcher_watch.sh &

# And get kama going.
kamailio -DD -E -e