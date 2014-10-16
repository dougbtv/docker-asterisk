FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.com>
ENV build_date 2014-10-02

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y npm wget git
RUN yum install -y docker

RUN npm install -g forever

ENV version_increment 0x00000b33f2
RUN git clone https://github.com/dougbtv/docker-asterisk.git

WORKDIR /docker-asterisk/tools/autobuilder
RUN npm install

# ENTRYPOINT [forever -e /var/log/autobuilder.log -o /var/log/autobuilder.log autobuilder.js ]