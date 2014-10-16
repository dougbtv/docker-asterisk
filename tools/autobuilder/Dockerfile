FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.com>
ENV build_date 2014-10-02

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y npm wget git

RUN npm install -g forever

RUN git clone https://github.com/dougbtv/docker-asterisk.git

WORKDIR /docker-asterisk/tools/autobuilder

ENTRYPOINT forever start -l /var/log/autobuilder.log /autobuilder/autobuilder.js