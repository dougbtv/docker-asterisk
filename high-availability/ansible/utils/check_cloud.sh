#!/bin/bash
for i in `seq 0 4`;
  do
    cat /var/lib/libvirt/images/coreos/coreos$i/openstack/latest/user_data
    echo "-------------------------------------"
  done 
