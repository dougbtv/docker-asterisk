#!/bin/bash
for i in `seq 0 4`;
  do
    cat /var/lib/libvirt/images/coreos$i/configdrive/openstack/latest/user_data | grep "discovery:"
  done 
