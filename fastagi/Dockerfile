FROM centos:centos6
MAINTAINER Doug Smith <dsmith@800response.com>
ENV build_date 2014-10-02

RUN yum update -y
RUN yum install -y php php-mysql php-process git php-devel php-pear gcc tar wget unzip nano xinetd

RUN echo "agi             4573/tcp                        # FAST AGI entry" >> /etc/services

RUN mkdir /agi
ADD agiLaunch.sh /
ADD agi.php /agi/
ADD xinetd_agi /etc/xinetd.d/agi

EXPOSE 4573

CMD xinetd -stayalive -dontfork -pidfile /var/run/xinetd.pid