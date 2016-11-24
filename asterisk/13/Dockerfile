FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2016-11-24

RUN yum update -y && \
    yum install -y epel-release && \
    yum install git kernel-headers gcc gcc-c++ cpp ncurses ncurses-devel libxml2 libxml2-devel sqlite sqlite-devel openssl-devel newt-devel kernel-devel libuuid-devel net-snmp-devel xinetd tar jansson-devel make bzip2 -y

WORKDIR /tmp
# Get pj project
RUN git clone -b pjproject-2.4.5 --depth 1 https://github.com/asterisk/pjproject.git

# Build pj project
WORKDIR /tmp/pjproject
RUN ./configure --prefix=/usr --libdir=/usr/lib64 --enable-shared --disable-sound --disable-resample --disable-video --disable-opencore-amr 1> /dev/null && \
    make dep 1> /dev/null && \
    make 1> /dev/null && \
    make install && \
    ldconfig && \
    ldconfig -p | grep pj

ENV AUTOBUILD_UNIXTIME 123124
WORKDIR /tmp

# Download asterisk.
RUN git clone -b certified/13.8 --depth 1 https://gerrit.asterisk.org/asterisk
WORKDIR /tmp/asterisk

# Configure
# and remove the native build option
# from: https://wiki.asterisk.org/wiki/display/AST/Building+and+Installing+Asterisk
RUN ./configure --libdir=/usr/lib64 1> /dev/null && \
    make menuselect.makeopts && \
    menuselect/menuselect \
    --disable BUILD_NATIVE \
    --enable cdr_csv \
    --enable chan_sip \
    --enable res_snmp \
    --enable res_http_websocket \
    --enable res_hep_pjsip \
    --enable res_hep_rtcp \
    menuselect.makeopts

# Continue with a standard make.
RUN make 1> /dev/null && \
    make install 1> /dev/null && \
    make samples 1> /dev/null
WORKDIR /

# Update max number of open files.
RUN sed -i -e 's/# MAXFILES=/MAXFILES=/' /usr/sbin/safe_asterisk && \
    # Set tty
    sed -i 's/TTY=9/TTY=/g' /usr/sbin/safe_asterisk && \
    # Create and configure asterisk for running asterisk user.
    useradd -m asterisk -s /sbin/nologin && \
    chown asterisk:asterisk /var/run/asterisk && \
    chown -R asterisk:asterisk /etc/asterisk/ && \
    chown -R asterisk:asterisk /var/{lib,log,spool}/asterisk && \
    chown -R asterisk:asterisk /usr/lib64/asterisk/

# support arbitrary user ids for openshift
RUN chgrp -R 0 /var/run/asterisk && \
    chmod -R g+rw /var/run/asterisk && \
    find /var/run/asterisk -type d -exec chmod g+x {} +

USER asterisk
CMD asterisk -f