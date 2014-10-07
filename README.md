# docker-asterisk

A set of Dockerfiles for running asterisk (and a FastAGI, one for PHP as it stands)

Also checkout my blog article @ [dougbtv.com](http://dougbtv.com/2014/10/02/docker-and-asterisk/).

You can [pull the image from dockerhub](https://registry.hub.docker.com/u/dougbtv/asterisk/).

Which is as simple as running:

    docker pull dougbtv/asterisk

---

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
    ├── Dockerfile
    ├── extensions.conf
    ├── iax.conf
    ├── fastagi
    │   ├── agiLaunch.sh
    │   ├── agi.php
    │   ├── Dockerfile
    │   └── xinetd_agi
    └── tools
        ├── asterisk-cli.sh
        ├── clean.sh
        └── run.sh

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

## Lessons Learned

* I needed to disable the `BUILD_NATIVE` compiler flag. Without asterisk would throw an `illegal instruction` when run in a new place.
  * [This stackexchange answer helped](http://stackoverflow.com/questions/19607378/illegal-instruction-error-comes-when-i-start-asterisk-1-8-22). Thanks arheops
  * Also this note [about Asterisk 11 release](https://wiki.asterisk.org/wiki/display/AST/New+in+11) provides some reference, too.