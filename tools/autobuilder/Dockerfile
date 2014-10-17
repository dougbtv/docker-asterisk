FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.com>
ENV build_date 2014-10-02

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y npm wget git
RUN yum install -y docker

RUN npm install -g forever

ENV version_increment 0x00000b33f7
RUN git clone https://github.com/dougbtv/docker-asterisk.git

WORKDIR /docker-asterisk/tools/autobuilder
RUN npm install

# Note this must match the --name of the "docker-in-docker" container
# RUN export DOCKER_HOST="tcp://dind:4444"
ENV DOCKER_HOST tcp://dind:4444

# ENTRYPOINT [forever -e /var/log/autobuilder.log -o /var/log/autobuilder.log autobuilder.js ]