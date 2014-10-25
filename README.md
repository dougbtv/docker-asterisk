# docker-asterisk

A set of Dockerfiles for running asterisk (and a FastAGI, one for PHP as it stands)

Also checkout my blog article @ [dougbtv.com](http://dougbtv.com/2014/10/02/docker-and-asterisk/).

You can [pull the image from dockerhub](https://registry.hub.docker.com/u/dougbtv/asterisk/).

Which is as simple as running:

    docker pull dougbtv/asterisk

## What is it based on?

Asterisk 13 has been released!

* The Dockerfile is in `asterisk/13/Dockerfile` & available with `docker pull dougbtv/asterisk13`

Dockerfile in the root directory is:

* Based on Centos 6.5 base image
* Latest current available version of Asterisk 11, certified branch
  * ...More branches to come in the future.
* Available with `docker pull dougbtv/asterisk`

## Check out the latest build!

The image is backed by an auto-building-irc-bot which watches for the latest tarball from downloads.asterisk.org, builds it into this docker image and then automatically pushes it to dockerhub.

Whenever a new build is created, the bot creates a pull request here, you can check out the latest merged pull requests, and you'll find a link to the results of the build posted on a paste bin. Here's [an example automatically generated pull request](https://github.com/dougbtv/docker-asterisk/pull/16), and here's [an example log](http://www.pasteall.org/54631/text). 

You can come visit the bot in `##asterisk-autobuilder` on freenode. Or, naturally feel free to run it yourself. (More docs on this to come, you'll find the commands the bot currently takes at the bottom of this readme.)

## Running it.

Asterisk with SIP tends to use a wide range of UDP ports (for RTP), so we have chosen to run the main aster container with `--net=host` option, until we can specify port ranges, we're [waiting on this PR!](https://github.com/docker/docker/pull/8167)

We publish the port for the FastAGI container (which is running xinetd), and then we call the loopback address from AGI. You could separate these and run them on different hosts, should you choose.

An important function is that we need to access the CLI, which we use `nsenter` for, a shortcut script you'll run from the host is included here as `tools/asterisk-cli.sh`

This gist of how we get it going (and also memorialized in the `tools/run.sh` script) is:

```bash
NAME_ASTERISK=asterisk
NAME_FASTAGI=fastagi

# Run the fastagi container.
docker run \
    -p 4573:4573 \
    --name $NAME_FASTAGI
    -d -t dougbtv/fastagi

# Run the main asterisk container.
docker run \
    --name $NAME_ASTERISK \
    --net=host \
    -d -t dougbtv/asterisk
```

## Building it.

Just issue, with your current-working-dir as the clone:

```bash
docker build -t dougbtv/asterisk .
docker build -t dougbtv/fastagi fastagi/.
```

## About it.

Let's inspect the important files in the clone

    .
    |-- Dockerfile
    |-- extensions.conf
    |-- fastagi/
    |   |-- agiLaunch.sh
    |   |-- agi.php
    |   |-- Dockerfile
    |   `-- xinetd_agi
    |-- iax.conf
    |-- modules.conf
    |-- README.md
    `-- tools/
        |-- asterisk-cli.sh
        |-- autobuilder/
        |   |
        |   ` ...
        |-- clean.sh
        `-- run.sh


In the root dir:

* `Dockerfile` what makes the dockerhub image `dougbtv/asterisk`
* `extensions.conf` a very simple dialplan
* `iax.conf` a sample iax.conf which sets up an IAX2 client (for testing, really)

The `fastagi/` dir:

* `Dockerfile` creates a Docker image that runs xinetd
* `xinetd_agi` the configuration for xinetd to run `agiLaunch.sh`
* `agiLaunch.sh` a shell script to kick off our xinetd process (a php script)
* `agi.php` a sample AGI script, replace this with your main AGI php processes

In the `tools/` dir are some utilities I find myself using over and over:

* `asterisk-cli.sh` runs the `nsenter` command (note: image name must contain "asterisk" for it to detect it, easy enough to modify to fit your needs)
* `clean.sh` kills all containers, and removes them.
* `run.sh` a suggested way to run the Docker container.

Finally, the `tools/` dir contains the `autobuilder/` dir, which is the node.js source code for the autobuilder bot, which watches for changes and then builds a new image and pushes it to dockerhub.

...Not listed is the `asterisk/` dir, where there's a sample build for Asterisk 13 beta. This Dockerfile works. Just getting the ducks in a row for when it's released.

## Bot commands

If you're checking out the bot, you'll notice just a few commands, most of which are most interesting during a build:

* `!build` initiates a build manually (only for authorized users)
* `!lastcmd` shows the last executed command during long builds
* `!tail` shows the last three lines of the log

## Lessons Learned

* I needed to disable the `BUILD_NATIVE` compiler flag. Without asterisk would throw an `illegal instruction` when run in a new place.
  * [This stackexchange answer helped](http://stackoverflow.com/questions/19607378/illegal-instruction-error-comes-when-i-start-asterisk-1-8-22). Thanks arheops
  * Also this note [about Asterisk 11 release](https://wiki.asterisk.org/wiki/display/AST/New+in+11) provides some reference, too.