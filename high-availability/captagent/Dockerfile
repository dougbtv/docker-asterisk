# https://github.com/sipcapture/captagent

FROM centos:centos6
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-21

RUN yum install -y libpcap automake expat-devel libtool git libpcap-devel

RUN git clone https://code.google.com/p/captagent/ captagent
WORKDIR /captagent/captagent

ENV foo 1234
RUN ./build.sh
RUN ./configure
RUN make && make install

COPY captagent.xml /usr/local/etc/captagent/captagent.xml
