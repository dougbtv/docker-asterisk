#!/bin/bash
# This runs INSIDE the docker container.

# Location of captagent.xml
PATH_CAPTAGENT_XML=/usr/local/etc/captagent/captagent.xml

# Options, defaults.
ETHERNET_DEV=eth0
CAPTURE_HOST=capture.homercloud.org
CAPTURE_PORT=9060
CAPTURE_ID=2001
CAPTURE_PASSWORD=myHep
CLI_PASSWORD=12345
CLI_PORT=8909

# Show help with --help

show_help() {
cat << EOF
Usage: ${0##*/} [--dev ETHERNET_DEV]
Sets configuration options for captagent
Cheifly, it sets up run-time options, by re-writing the configuration.
It then kicks off the captagent script in the foreground.

    --dev -d                Set ethernet device (default: eth0)
    --capturehost -h        Homer SIP capture host (default: capture.homercloud.org)
    --captureport -p        Homer SIP capture port (default: 9060)
    --captureid -i          Homer capture id (default: 2001)
    --capturepassword -w    Homer capture password (default: myHep)
    --clipassword -c        CLI password (default: 12345)
    --cliport -o            CLI port (default: 8909)

EOF
exit 0;
}

# Set options

while true; do
  case "$1" in
    -d | --dev )
      if [ "$2" == "" ]; then show_help; fi;
      ETHERNET_DEV=$2;
      echo "ETHERNET_DEV set to: $ETHERNET_DEV";
      shift 2 ;;
    -h | --capturehost )
      if [ "$2" == "" ]; then show_help; fi;
      CAPTURE_HOST=$2;
      echo "CAPTURE_HOST set to: $CAPTURE_HOST";
      shift 2 ;;
    -p | --captureport )
      if [ "$2" == "" ]; then show_help; fi;
      CAPTURE_PORT=$2;
      echo "CAPTURE_PORT set to: $CAPTURE_PORT";
      shift 2 ;;
    -i | --captureid )
      if [ "$2" == "" ]; then show_help; fi;
      CAPTURE_ID=$2;
      echo "CAPTURE_ID set to: $CAPTURE_ID";
      shift 2 ;;
    -w | --capturepassword )
      if [ "$2" == "" ]; then show_help; fi;
      CAPTURE_PASSWORD=$2;
      echo "CAPTURE_PASSWORD set to: $CAPTURE_PASSWORD";
      shift 2 ;;
    -c | --clipassword )
      if [ "$2" == "" ]; then show_help; fi;
      CLI_PASSWORD=$2;
      echo "CLI_PASSWORD set to: $CLI_PASSWORD";
      shift 2 ;;
    -o | --cliport )
      if [ "$2" == "" ]; then show_help; fi;
      CLI_PORT=$2;
      echo "CLI_PORT set to: $CLI_PORT";
      shift 2 ;;
    --help )
       	show_help;
       	exit 0 ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

# Replace values in template

perl -p -i -e "s/\{\{ ETHERNET_DEV \}\}/$ETHERNET_DEV/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CAPTURE_HOST \}\}/$CAPTURE_HOST/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CAPTURE_PORT \}\}/$CAPTURE_PORT/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CAPTURE_ID \}\}/$CAPTURE_ID/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CAPTURE_PASSWORD \}\}/$CAPTURE_PASSWORD/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CLI_PORT \}\}/$CLI_PORT/" $PATH_CAPTAGENT_XML
perl -p -i -e "s/\{\{ CLI_PASSWORD \}\}/$CLI_PASSWORD/" $PATH_CAPTAGENT_XML

# Finally, run captagent in foreground.

captagent -n