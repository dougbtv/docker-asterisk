This is a solution for keepalived that's been inspired by [aledbf/coreos-keepalived](https://github.com/aledbf/coreos-keepalived).

Taking the core idea, but, now have it running in a docker container on the host with `--net=host --privileged=true` so that the Docker container itself can manage the host networking.

Dockerfile:
```
FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-12
RUN yum install -y keepalived
```

Build it with: `docker build -t dougbtv/keepalived`

Note to set where your keepalived.conf is on the host, the example shows it @ `/opt/keepalived/keepalived.conf` -- using aledbf's `keepalived.conf` file. (Versioned in the same folder as here)

Run it like so:
```
docker run \
    -v /opt/keepalived/keepalived.conf:/etc/keepalived/keepalived.conf \
    --name=keepalived \
    --privileged=true \
    --net=host \
    -t dougbtv/keepalived \
    /usr/sbin/keepalived -f /etc/keepalived/keepalived.conf --dont-fork --log-console
```

Or have it in a fleet unit file, which is handy too, like this:

```
[Unit]
Description=keepalived
After=kamailio@%i.service
Requires=kamailio@%i.service

[Service]
TimeoutStartSec=0
ExecStartPre=-/usr/bin/docker kill keepalived
ExecStartPre=-/usr/bin/docker rm keepalived
ExecStartPre=/usr/bin/docker pull dougbtv/keepalived:latest
ExecStartPre=/bin/sh -c "/usr/sbin/sysctl -w net.ipv4.ip_nonlocal_bind=1"
ExecStart=/bin/sh -c "/usr/bin/docker run \
    -v /opt/keepalived/keepalived.conf:/etc/keepalived/keepalived.conf \
    --name=keepalived \
    --privileged=true \
    --net=host \
    -t dougbtv/keepalived \
    /usr/sbin/keepalived -f /etc/keepalived/keepalived.conf --dont-fork --log-console"
ExecStop=/usr/bin/docker stop keepalived

[X-Fleet]
MachineMetadata=boxrole=kamailio
MachineOf=kamailio@%i.service
Conflicts=keepalived@*.service
```