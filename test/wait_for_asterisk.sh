#!/bin/bash
while /bin/true; do
    logs=`docker logs $1`
    if [[ $logs =~ "Asterisk Ready" ]]; then
      echo "$1 asterisk is ready."
      break;
    else
      if [[ $logs =~ "pjlib 2.4.5 for POSIX initialized" ]]; then
        echo "$1 asterisk is ready."
        break;
      else          
        echo "waiting..."
        sleep 1
      fi
    fi
done