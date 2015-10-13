# A DIY Workshop -- Scaleable High-Availbility Asterisk using Docker and CoreOS

[For 2015 Astricon Conference](http://www.asterisk.org/community/astricon-user-conference/sessions/scaleable-high-availbility-asterisk-using-docker-and) as given by [Doug Smith](http://www.asterisk.org/community/astricon-user-conference/speakers/douglas-smith) (twitter: [@dougbtv](https://twitter.com/dougbtv)):

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

I manage a lot of Asterisk boxen every day for my day job, and I also am very interested in devops and I am the maintainer of the [Docker build server Bowline](http://bowline.io)

## Components

### Getting your development environment going

So, if you want to follow along and get this setup going, let's install the components you need. This tutorial assumes that you're running a Fedora workstation. But, that shouldn't matter a lot. You should be able to use whatever environment you want with a few quick changes, and in all likelihood if you're going to take this further -- you'll probably be running it in a much different environment.

But, the gist here is that we'll use `libvirt` and `virt-manager` to setup a set of 5 boxes to run the cluster on. 

So go ahead and install the components we require:

```bash
yum install -y libvirt virt-manage ansible git docker-io
```

Now, clone this project with:

```bash
git clone https://github.com/dougbtv/docker-asterisk.git
```

Now that you've got the clone, move into the `high-availability/` folder in the clone. That's where the meat is. The root is interesting too, it's got the Dockerfile for both Asterisk 11 certified and also Asterisk 13. But, for now hang out in the `high-availability/` dir

### What's in the clone?

Inside that `high-availability/` dir you'll find these subdirectories interesting...

```
├── ansible
│   └── Our configuration management playbooks.
├── homer
│   └── Homer Dockerfiles
├── itsp
│   └── A Dockerfile and configuration for a pretend telco
├── kamailio
│   └── Kamailio Dockerfile
├── kamailio-etcd-dispatcher
│   └── Our service discovery dispatcher Dockerfile
└── keepalived
    └── A keepalived dockerfile

```

### Docker

Docker is a way to "containerize" your applications. Generally, it's a layer ontop of LXC (linux containers) -- which has been around since 2008. What Docker really does well is improve the UX of using LXC. And I think Docker is great, however, there is some debate, so you should check out the other top dog, which is [RKT by the CoreOS people](https://github.com/coreos/rkt).

When you create the image for a container, you're creating a way to memorialize your changes to an environment. It gives you flexibility and portability in where you run these containers -- in dev on your laptop, in the cloud, in the closet, name it. And it's consistent. And you can easily spin up the processes that are containerized on boxes anywhere any time, dynamically -- using CoreOS (more on that in a minute)

Here's a couple examples of building Asterisk with Docker, firstly [this project -- docker-asterisk](https://github.com/dougbtv/docker-asterisk). But you should also take a look at what Leif Madsen and Avoxi have done @ [AVOXI/certified-asterisk](https://github.com/AVOXI/certified-asterisk). 

In this tutorial, the images are pulled from dockerhub. Specifically we'll be using these images:

* [dougbtv/asterisk](https://hub.docker.com/r/dougbtv/asterisk/) -- Asterisk 11 certified
* [dougbtv/kamailio](https://hub.docker.com/r/dougbtv/kamailio/) -- Kamailio 4.1.8
* [dougbtv/kamailio-etcd-dispatcher](https://hub.docker.com/r/dougbtv/kamailio-etcd-dispatcher/) -- kamailio-etcd-dispatcher 0.2.3
* [dougbtv/keepalived](https://hub.docker.com/r/dougbtv/keepalived/)

And then we also have kind of a slew for Homer, I'm not going to list them, but if you're interested in how I build it move into the `high-availability/homer` directory. 

I recommend for the tutorial to go ahead and pull the images from Dockerhub (you don't have to do anything now, the following steps will tell you how). But, when you're going into production -- you're going to want to build your own. Naturally, I trust my own images and I think you should trust my images (heck, they're the ones I built). However, for best practices -- you should know exactly what's going into your images. 

### CoreOS

[CoreOS is a minimal Linux](https://coreos.com/using-coreos/) that you use to run your containers. It's strapped with a bunch of great tools that we'll use to manage a cluster of machines, specifically [etcd](https://coreos.com/etcd/) & [fleet](https://coreos.com/using-coreos/clustering/).

For now, we're installing it on into VM's that can be used with libvirt/virt-manager, but, [there's a number of other ways to install CoreOS](https://coreos.com/os/docs/latest/#running-coreos). Which will likely be more appropriate to where and how you're running your platform.

### Ansible

This tutorial uses Ansible to automate a number of things. But, I want to emphasize that you don't need to be an Ansible expert. Mostly it's all right here, and you can just run the playbooks that I provide. In the future, you might want to reference them to create configuration management for the tool of your choice.

We'll walk you through the few things you'll need to change (mostly just in a YAML config file), but, feel free to dig through the `high-availability/ansible/` directory to see how all the gears turn.

### Things we won't cover.

* NAT (we make it all convenient, with an ITSP on the same subnet, in "real life" you can have fun with your typical NAT woes)
* Application Logging (you'll want centralized logging)
* Alerting (you'll probably monitor a real platform, right? right!?)

## Docker & CoreOS Review
## Bootstrapping your cluster

Now we can get into the thick of it!

You can spin up a cluster a number of ways, with physical machines, with cloud services like EC2 (CoreOS makes it easy for you with a quick 'deploy button' to spin up a new ec2 instance), or in this case, we'll use LibVirt & QEMU -- which if you're doing development on a linux workstation, makes it really easy to give it a go.

Let's download CoreOS, and remember where we put it.

```bash
wget http://stable.release.core-os.net/amd64-usr/current/coreos_production_qemu_image.img.bz2 -O - | bzcat > coreos_production_qemu_image.img
```

We use Ansible to automate a number of things that are difficult and/or time consuming to do one step at a time, and we'll use this to set up the facets of the CoreOS cluster so that everything is just right -- and it's memorialized in our Ansible playbooks.

If you need some intro and tips on how to use ansible checkout: `[STUB]`

Now let's browse to the `high-availability/ansible` directory in the clone, we're going to edit the vars file in question. Let's edit `vars/coreos.yml`, and mainly we'll set the location of the CoreOS image, and we'll add our private keys into the file.

N.B. If you're like me and you're going to version it but you don't want to expose credentials to your git repo, you can copy `vars/coreos.yml` to `vars/private.yml` and take advantage of the `.gitignore` in this project, and the fact that the playbooks account for this private file to override the defaults.

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
[doug@talos ansible]$ ssh -A core@coreos0
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

So you've loaded up the cluster, but, need to boot it fresh -- you can run the bootup playbook. It'll re-load the cloud config user data, and set the proper tokens for service discovery if the cluster is borked.


```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_bootup.yml
```

Buuuut, sometimes nodes just don't want to join the cluster. If you're creating a dynamic sized cluster, it can be painful. So we have a playbook which adds nodes which didn't make it into the cluster.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_repair.yml
```

And sometimes, a sniper rifle isn't enough. You need to shoot it with an RPG and blow away the etcd2 cache. Here we do it, and shutdown all the boxes to try to bring up etcd2 from a fresh cluster reboot

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_etcd2_reset.yml 
```

Sometimes, you wanna just start from scratch, so you can destroy the whole she-bang, so you can run the destroy playbook. Warning: This *will* delete the VM disks.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_destroy.yml
```

### Firing up our processes

First you'll want to pull in all the docker images, which, if you're pulling in from the public (which this whole document is based on) can take a while. In theory, you'll later want to have a local registry, try [Bowline](http://bowline.io) for an in-house registry and build server.

So run the playbook to pull 'em all in.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos cluster_big_pull.yml 
```

Now that you've got 'em all pulled, let's load up our fleet unit files, and start the processes.

But wait, THERE'S MORE. You're going to need for forward your ssh keys, via ssh-agent -- [here's the documentation for the fleet client](https://github.com/coreos/fleet/blob/master/Documentation/using-the-client.md#remote-fleet-access). So to do this, let's use the example from the [DigitalOcean trouble shooting guide](https://www.digitalocean.com/community/tutorials/how-to-troubleshoot-common-issues-with-your-coreos-servers).

```bash
eval $(ssh-agent)
ssh-add
```

Then when we ssh to a host, we need to use the -A flag, e.g.

```bash
ssh -A core@coreos0
```

Now that you've got everything pulled, let's go ahead and load up all of our fleet units -- these are the description of the process we want to run, in what container, and it's dependancies. We'll get into the detail of fleet units later on.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos update_units.yml 
```

At this point, you should have mostly everything up and running, but, not homer yet. It doesn't have the right configs in the database, so let's load that.

```bash
[doug@talos ansible]$ ansible-playbook -i inventory/coreos homer_setupdb.yml 
```

And I'd recommend you update units at this point again with the `update_units.yml` playbook.


## Service Discovery
## Using kamailio-etcd-dispatcher

Load balancing percentage, for use with a [Canary Release](http://martinfowler.com/bliki/CanaryRelease.html)

## Managing the cluster

Fleet is a scheduler used to tell the cluster about the processes we'll spin up.

### Using Fleet

Let's look at the machines available in the cluster

```bash
core@coreos0 ~ $ fleetctl list-machines
MACHINE		IP		METADATA
3873cea9...	192.168.2.200	boxrole=kamailio
4b8e25a8...	192.168.2.202	boxrole=asterisk
7f7a88e4...	192.168.2.203	boxrole=asterisk
b13da368...	192.168.2.204	boxrole=homer
ddb16be2...	192.168.2.201	boxrole=kamailio
```

If you've followed all the steps for "Bootstrapping Your Cluster" above, you should have a few instances of Asterisk/Kamailio/Homer/etc running.

```bash
core@coreos0 ~ $ fleetctl list-units
UNIT						MACHINE						ACTIVE		SUB
announcer@1.service			7f7a88e4.../192.168.2.203	inactive	dead
announcer@2.service			4b8e25a8.../192.168.2.202	inactive	dead
asterisk@1.service			7f7a88e4.../192.168.2.203	active		running
asterisk@2.service			4b8e25a8.../192.168.2.202	active		running
captagent@1.service			7f7a88e4.../192.168.2.203	active		running
captagent@2.service			4b8e25a8.../192.168.2.202	active		running
captureserver@1.service		b13da368.../192.168.2.204	active		running
dispatcher@1.service		3873cea9.../192.168.2.200	active		running
dispatcher@2.service		ddb16be2.../192.168.2.201	active		running
homerannouncer@1.service	b13da368.../192.168.2.204	active		running
homerweb@1.service			b13da368.../192.168.2.204	active		running
kamailio@1.service			3873cea9.../192.168.2.200	active		running
kamailio@2.service			ddb16be2.../192.168.2.201	active		running
keepalived@1.service		3873cea9.../192.168.2.200	active		running
keepalived@2.service		ddb16be2.../192.168.2.201	active		running
mysql@1.service				b13da368.../192.168.2.204	active		running
````

Let's say that you want hit up the asterisk terminal on the first asterisk instance. You could issue:

```bash
core@coreos0 ~ $ fleetctl ssh asterisk@1 docker exec -it asterisk asterisk -rvvv
[...]
coreos3*CLI>
```

Or let's pick up the dispatcher config for Kamailio to check out what our load balacing looks like:

```bash
core@coreos0 ~ $ fleetctl ssh dispatcher@1 docker exec -t kamailio cat /etc/kamailio/dispatcher.list
# Autogenerated @ Saturday, September 5th 2015, 2:01:37 pm
1 sip:192.168.2.200:5060 0 0 weight=50
1 sip:192.168.2.200:5060 0 0 weight=50
```

You can also get the logs for any instance in the cluster, too.

```bash
core@coreos0 ~ $ fleetctl journal -f asterisk@1 
-- Logs begin at Sun 2015-08-30 13:17:14 UTC, end at Sat 2015-09-05 12:46:42 UTC. --
Sep 05 12:10:01 coreos3 docker[1143]: [Sep  5 13:10:01] NOTICE[1]: config.c:2425 ast_config_engine_register: Registered Config Engine sqlite3
```
### Kamailio setup

The high-availability is front by a VIP that we'll share between Kamailio boxen using keepalived.

Here, we use a container that has "priviledged networking" -- This container can change the networking configuration of the host it's running on.

If you'd like [another reference about Kamailio using keepalived, I highly recommend this article](http://blog.unicsolution.com/2015/01/kamailio-high-availability-with.html?m=1).

To be a truely active-active cluster -- we need one thing that's not covered right now is replicated dialogue state. In order to achieve it, typically one also wants to back the Kamailio cluster with a redundant database. Database redundancy is a whole 'nother beast on it's own, and isn't necessarily appropriate in this demonstration, where we're looking to focus primarily on a platform for HA Asterisk, but, as usual, there's always more. Database redundancy isn't rocket science, but, it is indeed bigger than a breadbox. This setup should give you a framework on which to build this additional components. 

A couple things to look at:

* [The Kamailio Dialogue module](http://kamailio.org/docs/modules/devel/modules/dialog.html#idp15368320)
  * "[use] the dialog module in db-only mode (db_mode = 1)" [see this post](https://www.mail-archive.com/sr-users@lists.sip-router.org/msg22121.html)
* [A nice sr-users post about active-active Kamailio](https://www.mail-archive.com/sr-users@lists.sip-router.org/msg22111.html) 
* [You might consider the Kamailio db_cluster module](http://kamailio.org/docs/modules/4.1.x/modules/db_cluster.html)
* Another aproach (or better, in conjunction) is to use DNS SRV records, [Olle E. Johansson's SIP & DNS Presentation](http://www.slideshare.net/oej/sip-and-dns)
* [What the heck is `t_replicate`](http://www.kamailio.org/docs/modules/4.3.x/modules/tm.html#tm.f.t_replicate), it only gave me trouble.


With the currently given setup, you'll still be up and running and you'll be sending calls reliably to the Asterisk boxes. However, calls in an intermediate state might wind up in another intermediate-intermedia state, that is...

In the case of a Kamailio failure, we have --

On the upside:
* Calls that are up, will stay up
* Calls that are on their way in, will still stay in.

On the downside:
* If a call is between `INVITE` and sending media, the call might never make it in.
* If a call is sending media, there's a chance neither side hears the `BYE`.

You can prevent those downsides with either (or both)

1. Replicating dialogue state
2. Using DNS-SRV records

### Using Homer

It's easy, but, you should go and get your feet wet. If everything else has worked up to this point (hopefully you weren't mired somewhere!) you should just be able to point at the `homerweb` instance, look for it in `fleetctl list-units`

```bash
core@coreos0 ~ $ fleetctl list-units
UNIT						MACHINE						ACTIVE		SUB
[...]
homerweb@1.service			b13da368.../192.168.2.204	active		running
````
And browse around.

### So you actually want to put a call over this bad jackson, huh? 

We'll just run a docker container on our workstation in order to do this. Then we're going to run a "pretend ITSP" (internet telephony service provider) Firstly pull my primary Asterisk image with:

```
docker pull dougbtv/asterisk
```

Then move into the `high-availability/itsp` directory. We have to configure one thing by hand here, it's the VIP for Kamailio. Edit the `sip.conf` here and change this line:

```
host=192.168.2.199
````

Change it to the Kamailio VIP, which we had set earlier in the Ansible variables when we built out the cluster. (It's in the `high-availbility/ansible/vars/coreos.yml` file)

And we'll get it running with this shell script:

```
./run.sh
```

Which starts up our pretend ITSP with that custom `sip.conf` file -- it runs it interactively/ Now that it's up and running, go ahead and run this cheesey autodialer with this command (inside the container):

```
./autocaller.sh
```

It basically just creates a new asterisk call file every 30 seconds. Go ahead and edit that shell script if you'd like to test it differently, or be brave and run [sipp](http://sipp.sourceforge.net/) against it, or whatever scripts you'd usually use to load up some boxen.

## Learning more

### Kubernetes

Kubernetes may be a choice as you scale up, and you're looking at dynamic scaling and scheduling. I think it's worthwhile to get a handle on if you're serious about a containerized cluster. Herein, fleet is appropriate, we can use it to get some lower level networking.

## Troubleshooting

Having a node go down and rejoin an exiting cluster can be a pain. You can't just use discovery. So, what to do? I started off with [this guy having the same issue](https://github.com/coreos/etcd/issues/2807).

But what I was really having trouble finding was [the documentation for runtime configuration](https://github.com/coreos/etcd/blob/master/Documentation/runtime-configuration.md)

And I really want [add a new member to the cluster](https://github.com/coreos/etcd/blob/master/Documentation/runtime-configuration.md#add-a-new-member)

Here's an example of adding one by hand:

```
etcdctl member add coreos4 http://192.168.122.204:2380

export ETCD_DATA_DIR=/var/lib/etcd2
export ETCD_NAME="coreos4"
export ETCD_INITIAL_CLUSTER="682a6dccdb58a44ba63e54404a9dfb3f=http://192.168.122.201:2380,b738ee88b95aba4ba8cdaf52b7646f6e=http://192.168.122.202:2380,coreos4=http://192.168.122.204:2380,abdd20d5cf1e414888e84042dd800a83=http://192.168.122.200:2380"
export ETCD_INITIAL_CLUSTER_STATE="existing"

export ETCD_DISCOVERY=""

etcd2 -listen-client-urls http://0.0.0.0:2379 -advertise-client-urls http://192.168.122.204:2379  -listen-peer-urls http://0.0.0.0:2380 -initial-advertise-peer-urls http://192.168.122.204:2380
```

You might want etcd's [configuration environment variables, too](https://github.com/coreos/etcd/blob/master/Documentation/configuration.md)