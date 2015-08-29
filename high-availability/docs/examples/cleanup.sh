#!/bin/bash
rm -f /var/lib/libvirt/images/coreos/*qcow2*
rm -Rf /var/lib/libvirt/images/coreos/coreos0
rm -Rf /var/lib/libvirt/images/coreos/coreos1
rm -Rf /var/lib/libvirt/images/coreos/coreos2
rm -Rf /var/lib/libvirt/images/coreos/coreos3
rm -Rf /var/lib/libvirt/images/coreos/coreos4
ls /var/lib/libvirt/images/coreos/ -l
