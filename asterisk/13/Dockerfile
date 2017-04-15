FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2016-05-15

RUN yum update -y
RUN yum install -y epel-release
RUN yum install git kernel-headers gcc gcc-c++ cpp ncurses ncurses-devel libxml2 libxml2-devel sqlite sqlite-devel openssl-devel newt-devel kernel-devel libuuid-devel net-snmp-devel xinetd tar jansson-devel make bzip2 gettext -y

WORKDIR /tmp
# Get pj project
RUN git clone -b pjproject-2.4.5 --depth 1 https://github.com/asterisk/pjproject.git

# Build pj project
WORKDIR /tmp/pjproject
RUN ./configure --prefix=/usr --libdir=/usr/lib64 --enable-shared --disable-sound --disable-resample --disable-video --disable-opencore-amr 1> /dev/null
RUN make dep 1> /dev/null
RUN make 1> /dev/null
RUN make install
RUN ldconfig
RUN ldconfig -p | grep pj

ENV AUTOBUILD_UNIXTIME 123124
WORKDIR /tmp

# Download asterisk.
RUN git clone -b certified/13.8 --depth 1 https://gerrit.asterisk.org/asterisk
WORKDIR /tmp/asterisk

# Configure
RUN ./configure --libdir=/usr/lib64 1> /dev/null
# Remove the native build option
# from: https://wiki.asterisk.org/wiki/display/AST/Building+and+Installing+Asterisk
RUN make menuselect.makeopts
RUN menuselect/menuselect \
  --disable BUILD_NATIVE \
  --enable cdr_csv \
  --enable chan_sip \
  --enable res_snmp \
  --enable res_http_websocket \
  --enable res_hep_pjsip \
  --enable res_hep_rtcp \
  menuselect.makeopts

# Continue with a standard make.
RUN make 1> /dev/null
RUN make install 1> /dev/null
RUN make samples 1> /dev/null
WORKDIR /

# Update max number of open files.
RUN sed -i -e 's/# MAXFILES=/MAXFILES=/' /usr/sbin/safe_asterisk

CMD asterisk -f
