#!/bin/bash
# This runs INSIDE the docker container.

# Location of captagent.xml
PATH_KAMAILIO_CFG=/etc/kamailio/kamailio.cfg

# Options, defaults.
DB_USER=homer
DB_PASS=homersecret
DB_HOST=mysql
LISTEN_PORT=9060
# Show help with --help

show_help() {
cat << EOF
Usage: ${0##*/} [--dev ETHERNET_DEV]
Sets configuration options for sip capture server, kamailio for homer.
It will template in some variables for you in kamailio.cfg

    --listenport -l         Kamailio Listen port for HEP (9060)
    --dbpass -p             MySQL password (homersecret)
    --dbuser -u             MySQL user (homer)
    --dbhost -h             MySQL host (172.17.42.1 [docker0 bridge])

EOF
exit 0;
}

# Set options

while true; do
  case "$1" in
    -l | --listenport )
      if [ "$2" == "" ]; then show_help; fi;
      LISTEN_PORT=$2;
      echo "LISTEN_PORT set to: $LISTEN_PORT";
      shift 2 ;;
    -p | --dbpass )
      if [ "$2" == "" ]; then show_help; fi;
      DB_PASS=$2;
      echo "DB_PASS set to: $DB_PASS";
      shift 2 ;;
    -h | --dbhost )
      if [ "$2" == "" ]; then show_help; fi;
      DB_HOST=$2;
      echo "DB_HOST set to: $DB_HOST";
      shift 2 ;;
    -u | --dbuser )
      if [ "$2" == "" ]; then show_help; fi;
      DB_USER=$2;
      echo "DB_USER set to: $DB_USER";
      shift 2 ;;
    --help )
       	show_help;
       	exit 0 ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

# Replace values in template

perl -p -i -e "s/\{\{ LISTEN_PORT \}\}/$LISTEN_PORT/" $PATH_KAMAILIO_CFG
perl -p -i -e "s/\{\{ DB_PASS \}\}/$DB_PASS/" $PATH_KAMAILIO_CFG
perl -p -i -e "s/\{\{ DB_HOST \}\}/$DB_HOST/" $PATH_KAMAILIO_CFG
perl -p -i -e "s/\{\{ DB_USER \}\}/$DB_USER/" $PATH_KAMAILIO_CFG

# Make an alias, kinda.
kamailio=/usr/local/kamailio/sbin/kamailio

# Test the syntax.
$kamailio -f $PATH_KAMAILIO_CFG -c

# Now, kick it off.
$kamailio -f $PATH_KAMAILIO_CFG -DD -E -e