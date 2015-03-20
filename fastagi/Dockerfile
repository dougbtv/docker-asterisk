FROM centos:centos6
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2015-03-20

RUN yum update -y
RUN yum install -y php php-mysql php-process git php-devel php-pear gcc tar wget unzip nano xinetd rsyslog

RUN echo "agi             4573/tcp                        # FAST AGI entry" >> /etc/services

RUN mkdir /agi
ADD agiLaunch.sh /
ADD agi.php /agi/
ADD xinetd_agi /etc/xinetd.d/agi

EXPOSE 4573

CMD service rsyslog start && xinetd -stayalive -dontfork -pidfile /var/run/xinetd.pid
