#!/bin/bash
# This runs INSIDE the docker container.

# Location of captagent.xml
PATH_HOMER_CONFIG=/var/www/html/webhomer/configuration.php

# Options, defaults.
DB_USER=homer
DB_PASS=homersecret
DB_HOST=mysql
LISTEN_PORT=9060
# Show help with --help

show_help() {
cat << EOF
Usage: ${0##*/} [--dev ETHERNET_DEV]
Sets configuration options for php files in homer

    --dbpass -p             MySQL password (homersecret)
    --dbuser -u             MySQL user (homer)
    --dbhost -h             MySQL host (172.17.42.1 [docker0 bridge])

EOF
exit 0;
}

# Set options

while true; do
  case "$1" in
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
perl -p -i -e "s/\{\{ DB_PASS \}\}/$DB_PASS/" $PATH_HOMER_CONFIG
perl -p -i -e "s/\{\{ DB_HOST \}\}/$DB_HOST/" $PATH_HOMER_CONFIG
perl -p -i -e "s/\{\{ DB_USER \}\}/$DB_USER/" $PATH_HOMER_CONFIG

# Argh permission giving me hell. Needed for generating images.
chmod -R 0777 /var/www/html/webhomer/tmp/

# Foreground apache.
apachectl -DFOREGROUND