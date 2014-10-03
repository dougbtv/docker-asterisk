FROM centos:centos6
MAINTAINER Doug Smith <dsmith@800response.com>
ENV build_date 2014-10-02

RUN yum update -y
RUN yum install -y php php-mysql php-process git php-devel php-pear gcc tar wget unzip nano xinetd

RUN echo "agi             4573/tcp                        # FAST AGI entry" >> /etc/services

RUN mkdir /agi
ADD agiLaunch.sh /agi/
ADD agi.php /agi/

EXPOSE 4573