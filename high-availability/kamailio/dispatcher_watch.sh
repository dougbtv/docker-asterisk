#!/bin/bash
# Author: Doug Smith <info@laboratoryb.org>
# ---------------------------------------------------------
# For Kamailio.
# This watches for the dispatcher list to be updated
# ...and then reloads the dispatcher in Kamailio.

while true; do
  change=$(inotifywait -e close_write,moved_to,create /etc/kamailio)
  # change=${change#/etc/kamailio * }
  if [[ $change =~ 'dispatcher.list' ]]; then
  	echo "------------------------ dispatcher reloading"
    kamcmd dispatcher.reload;
    kamcmd dispatcher.list;
    echo "------------------------ end reloading"
  fi
done