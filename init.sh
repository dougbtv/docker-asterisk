#!/bin/bash
# ---------------------------------------------------
# -- Init.sh - Entrypoint for Asterisk dockerfile  -
# ---------------------------------------------------

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
envsubst < /tmp/passwd.template > /tmp/passwd
export LD_PRELOAD=libnss_wrapper.so
export NSS_WRAPPER_PASSWD=/tmp/passwd
export NSS_WRAPPER_GROUP=/etc/group

/usr/sbin/asterisk -f -U asterisk -G asterisk -vvvg -c