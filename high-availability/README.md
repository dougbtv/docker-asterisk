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



## Docker & CoreOS Review
## Service Discovery
## Using kamailio-etcd-dispatcher
## Managing the cluster

### Using Fleet

## Learning more

