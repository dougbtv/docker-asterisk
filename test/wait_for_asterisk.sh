#!/bin/bash
while /bin/true; do
	logs=`docker logs $1`
	if [[ $logs =~ "Asterisk Ready" ]]; then
	  echo "$1 asterisk is ready."
      break;
    else
      echo "waiting..."
      sleep 1
    fi
done