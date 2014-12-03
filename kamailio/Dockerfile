FROM centos:centos6
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-10-24

RUN yum update -y
RUN yum install -y nano wget
RUN wget -O /etc/yum.repos.d/kamailio.repo http://download.opensuse.org/repositories/home:/kamailio:/telephony/CentOS_CentOS-6/home:kamailio:telephony.repo
RUN yum install -y kamailio
RUN yum install -y rsyslog
RUN echo "local0.*                        -/var/log/kamailio.log" >> /etc/rsyslog.conf

COPY run.sh /run.sh
COPY kamailio.cfg /etc/kamailio/kamailio.cfg
COPY dispatcher.list /etc/kamailio/dispatcher.list