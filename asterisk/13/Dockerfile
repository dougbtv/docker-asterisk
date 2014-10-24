FROM centos:centos6
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-10-24

RUN yum update -y
RUN yum install kernel-headers gcc gcc-c++ cpp ncurses ncurses-devel libxml2 libxml2-devel sqlite sqlite-devel openssl-devel newt-devel kernel-devel libuuid-devel net-snmp-devel xinetd tar -y

# Get pj project
RUN yum install -y bzip2
RUN mkdir /tmp/pjproject
RUN curl -sf -o /tmp/pjproject.tar.bz2 -L http://www.pjsip.org/release/2.3/pjproject-2.3.tar.bz2
RUN tar -xjvf /tmp/pjproject.tar.bz2 -C /tmp/pjproject --strip-components=1
WORKDIR /tmp/pjproject
RUN ./configure --prefix=/usr --enable-shared --disable-sound --disable-resample --disable-video --disable-opencore-amr
RUN make dep
RUN make
RUN make install
RUN ldconfig
RUN ldconfig -p | grep pj

WORKDIR /

ENV AUTOBUILD_UNIXTIME 123123

# Download asterisk.
# This is an experiment for Asterisk 13
RUN curl -sf -o /tmp/asterisk.tar.gz -L http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-13-current.tar.gz

# gunzip asterisk
RUN mkdir /tmp/asterisk
RUN tar -xzf /tmp/asterisk.tar.gz -C /tmp/asterisk --strip-components=1
WORKDIR /tmp/asterisk

# Extra deps.
RUN yum install -y epel-release
RUN yum install -y jansson-devel

# make asterisk.
ENV rebuild_date 2014-10-07
# Configure
RUN ./configure --libdir=/usr/lib64
# Remove the native build option
RUN make menuselect.makeopts
# Idea! 
#         menuselect/menuselect --disable BUILD_NATIVE menuselect.makeopts
# from: https://wiki.asterisk.org/wiki/display/AST/Building+and+Installing+Asterisk
RUN sed -i "s/BUILD_NATIVE//" menuselect.makeopts
# Continue with a standard make.
RUN make
RUN make install
RUN make samples
WORKDIR /

RUN mkdir -p /etc/asterisk
# ADD modules.conf /etc/asterisk/
ADD iax.conf /etc/asterisk/
ADD extensions.conf /etc/asterisk/

CMD asterisk -f
