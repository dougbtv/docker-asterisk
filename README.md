# docker-asterisk

A set of Dockerfiles for running asterisk (and eventually, FastAGI)

Also checkout my blog article @ PLACEHOLDER.

You can [pull the image from dockerhub](https://registry.hub.docker.com/u/dougbtv/asterisk/).

Which is as simple as running:

    docker pull dougbtv/asterisk

Let's inspect the important files in the clone

    .
    |-- Dockerfile
    |-- extensions.conf
    |-- iax.conf
    |-- modules.conf
    `-- tools
        |-- asterisk-cli.sh
        |-- clean.sh
        `-- run.sh

In the root dir:

* `Dockerfile` what makes the dockerhub image `dougbtv/asterisk`
* `extensions.conf` a very simple dialplan
* `iax.conf` a sample iax.conf which sets up an IAX2 client (for testing, really)
* `modules.conf` currently unused, but an example for overriding the modules.conf from the sample files.

In the `tools/` dir are some utilities I find myself using over and over:

* `asterisk-cli.sh` runs the `nsenter` command (note: image name must contain "asterisk" for it to detect it, easy enough to modify to fit your needs)
* `clean.sh` kills all containers, and removes them.
* `run.sh` a suggested way to run the Docker container.

That's about it, for now!