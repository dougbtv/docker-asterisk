# Scaleable High-Availbility Asterisk using Docker and CoreOS

[For 2015 Astricon Conference](http://www.asterisk.org/community/astricon-user-conference/sessions/scaleable-high-availbility-asterisk-using-docker-and) as given by [Doug Smith](http://www.asterisk.org/community/astricon-user-conference/speakers/douglas-smith):

*Reboot your infrastructure and deploy Asterisk in a highly-available and scalable fashion using Docker and CoreOS. You'll learn how to use the latest tools in containerization in order to use service discovery to spin up new Asterisk boxes in a snap. Using containerization stream-lines the process for developers, makes deployment a breeze for systems administrators, and service discovery makes "the good problems" like scaling up your business feel like "the easy problems".*

## Overview

1. Introduction
2. Components
3. Docker & CoreOS Review
4. Service Discovery
5. Using kamailio-etcd-dispatcher
6. Managing the cluster
7. Learning more

## Introduction

I'm [@dougbtv](https://twitter.com/dougbtv), and I went searching for a way to run high availability Asterisk, and I never could find just the right tools to keep all the complexity organized.

I spent a lot of timing re-doing the same steps over and over again with each individual machine. Especially Kamailio always felt harder than it needed to be, typically by my own fault. Generally, Asterisk is the place where I feel at home. I'm a developer and it always felt like it was under control, so deploying code to it and having it run well -- I took for granted.

But when I started adding more and more machines to a cluster, it always seemed more out of hand. And it was hard to document and memorialize the massive numbers of changes to get the cluster just right.

I work in telepony, and {stub} about employment.

This entire presentation is available in markdown format.

## Components

### Docker

Docker is a way to "containerize" your applications. Generally, it's a layer ontop of LXC -- which has been around since 2008.

When you create the image for a container, you're creating a way to memorialize your changes to an environment. It gives you flexibility and portability in where you run these containers -- in dev on your laptop, in the cloud, in the closet, name it. And it's consistent.

Here's a sample dockerfile for building Asterisk, it gives you all the steps to compile Asterisk, and then you "cook it into an image" (`docker build`)

```
stub for dockerfile
```

### CoreOS

CoreOS is a mimimal Linux that you use to run your containers. It

Docker isn't the only container option.

### Things we won't cover.

* NAT
* Logging (you'll want centralized logging)
* Alerting


## Docker & CoreOS Review
## Spinning up a cluster

You can spin up a cluster a number of ways, with physical machines, with cloud services like EC2 (CoreOS makes it easy for you with a quick 'deploy button' to spin up a new ec2 instance), or in this case, we'll use LibVirt & QEMU -- which if you're doing development on a linux workstation, makes it really easy to give it a go.

Let's download CoreOS, and remember where we put it.

```bash
wget http://stable.release.core-os.net/amd64-usr/current/coreos_production_qemu_image.img.bz2 -O - | bzcat > coreos_production_qemu_image.img
```

We use Ansible to automate a number of things that are difficult and/or time consuming to do one step at a time, and we'll use this to set up the facets of the CoreOS cluster so that everything is just right -- and it's memorialized in our Ansible playbooks.

If you need some intro and tips on how to use ansible checkout: `[STUB]`

Now let's browse to the `high-availability/ansible` directory in the clone, we're going to edit the vars file in question. Let's edit `vars/coreos.yml`, and mainly we'll set the location of the CoreOS image, and we'll add our private keys into the file.

You also could set the proper IP addresses to use, too. I like to create entries in `/etc/hosts` to later ssh to the CoreOS machines to inspect them.

```yml
image_source: "/home/doug/Downloads/coreos_production_qemu_image.img"
public_ssh_keys: 
    - "ssh-dss AAAAB3...."
    - "ssh-dss AAAAB3...."
```

We'll use an Ansible playbook to spin up the cluster, and we'll need to know the location of the qemu image, and we'll need our ssh keys in there so we have access to the virtual machines that we spin up.

These playbooks use your localhost as the host for the virtual machine guests, so make sure you have ssh keys for yourself on your own machine. 

Then we'll run the playbook a la:

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_creator.yml 
```

Now you should be able to access the boxen via ssh, a la:

```bash
[doug@talos ansible]$ ssh core@coreos0
Last login: Sat Aug 22 13:25:21 2015 from 192.168.122.1
CoreOS stable (723.3.0)
core@coreos0 ~ $ sudo su -
coreos0 ~ # 
```

Note that we use the use "core" and we can use sudo from there. The remainder of the playbooks use this construct, you can see that we set this paradigm between seeing the `ansible_ssh_user=core` in the inventory and then use `sudo: true` in the playbooks.

First thing you should do once your cluster is up is enable Ansible on it, we'll use an ansible galaxy role to get it setup for ansible.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos bootstrap_ansible_coreos.yml 
```

Ooops! You messed something up with the cluster? You can run the rediscover playbook. It'll re-load the cloud config user data, and set the proper tokens for service discovery if the cluster is borked.

Firstly, you'll want to spin down your CoreOS cluster, this allows you to flush out 

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_spindown.yml
```

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_rediscover.yml
```



## Service Discovery
## Using kamailio-etcd-dispatcher

Load balancing percentage, for use with a [Canary Release](http://martinfowler.com/bliki/CanaryRelease.html)


## Managing the cluster

### Using Fleet
### Using Homer

## Learning more

### Kubernetes

Kubernetes may be a choice as you scale up, and you're looking at dynamic scaling and scheduling. However, we tend to have some heavier networking requirements for VoIP, which provides a challenge.
