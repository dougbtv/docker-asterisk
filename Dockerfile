FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2016-11-23

RUN yum update -y && \
    yum install kernel-headers gcc gcc-c++ cpp ncurses ncurses-devel libxml2 libxml2-devel sqlite sqlite-devel openssl-devel newt-devel kernel-devel libuuid-devel net-snmp-devel xinetd tar make git -y 

ENV AUTOBUILD_UNIXTIME 1418234402

# Download asterisk.
WORKDIR /tmp/
RUN git clone -b certified/11.6 --depth 1 https://gerrit.asterisk.org/asterisk
WORKDIR /tmp/asterisk

# make asterisk.
ENV rebuild_date 2015-05-15
# Configure
RUN ./configure --libdir=/usr/lib64 1> /dev/null
# Remove the native build option
RUN make menuselect.makeopts && \
    menuselect/menuselect \
    --disable BUILD_NATIVE \
    --enable cdr_csv \
    --enable chan_sip \
    --enable res_snmp \
    --enable res_http_websocket \
    menuselect.makeopts

# Continue with a standard make.
RUN make 1> /dev/null
RUN make install 1> /dev/null
RUN make samples 1> /dev/null
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

# Running asterisk with user asterisk.
CMD /usr/sbin/asterisk -f -U asterisk -G asterisk -vvvg -c
USER asterisk