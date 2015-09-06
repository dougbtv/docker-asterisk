#!/bin/bash

# Using syslog for now? 
# ...don't later.
service rsyslog start

# This reloads dispatcher when the list is changed.
/dispatcher_watch.sh &

# We let you set some memory variables
# ...which have defaults (see: http://www.cyberciti.biz/faq/bash-ksh-if-variable-is-not-defined-set-default-variable/)
# so you can do so say: docker run -e "KAMAILIO_SHR=1024" -it dougbtv/kamailio /bin/bash
# which runs with 1024 megs of shared memory.
kama_shr=${KAMAILIO_SHR-64}
kama_pkg=${KAMAILIO_PKG-24}

# And get kama going.
kamailio -M ${kama_pkg} -m ${kama_shr} -DD -E -e