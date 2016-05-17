# This is a Dockerfile that's mostly an example, it's for a PHP-based FastAGI container.
FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2015-03-20

RUN yum update -y
RUN yum install -y php php-mysql php-process git php-devel php-pear gcc tar wget unzip nano xinetd rsyslog

# Add configuration to listen for the agi service.
RUN echo "agi             4573/tcp                        # FAST AGI entry" >> /etc/services

# Here's your agi code.
RUN mkdir /agi
ADD agiLaunch.sh /
ADD agi.php /agi/
ADD xinetd_agi /etc/xinetd.d/agi

# PHP when using syslog, well... needs a syslog service, fudge. 
# That's a downer. So, we're going to put this in here. I don't like it (-Doug)
ADD rsyslog.conf /etc/rsyslog.conf
# This is what listens on the journald socket, so, remove it (no journald running)
RUN rm /etc/rsyslog.d/listen.conf

# Expose the default port for agi
EXPOSE 4573

CMD /sbin/rsyslogd -i /var/run/syslogd.pid && xinetd -stayalive -dontfork -pidfile /var/run/xinetd.pid
