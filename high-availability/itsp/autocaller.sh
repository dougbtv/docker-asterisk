#!/bin/bash

SLEEP_LENGTH=30;

while true; do

	unique_id=$(cat /proc/sys/kernel/random/uuid)
	unique_src=/tmp/$unique_id.call
	unique_dst=/var/spool/asterisk/outgoing/$unique_id.call

	cat > $unique_src <<- EOM
Channel: SIP/cluster/999
MaxRetries: 2
RetryTime: 60
WaitTime: 30
Application: Wait
Data: 5
EOM

	mv $unique_src $unique_dst

	sleep $SLEEP_LENGTH

done