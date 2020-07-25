FROM centos:centos7
LABEL maintainer='Doug Smith <info@laboratoryb.org>' contributors='Christophe Langenberg <christophe@langenberg.be>'
ENV build_date 2016-05-15
ENV AUTOBUILD_UNIXTIME 123124

RUN yum update -y \
    && yum install -y \
                epel-release \
                git \
                kernel-headers \
                wget \
                gcc \
                gcc-c++ \
                cpp \
                ncurses \
                ncurses-devel \
                libxml2 \
                libxml2-devel \
                sqlite \
                sqlite-devel \
                openssl-devel \
                newt-devel \
                kernel-devel \
                libuuid-devel \
                net-snmp-devel \
                xinetd \
                tar \
                jansson-devel \
                make \
                bzip2 \
                gettext \
    && yum clean all \
    && cd /tmp \
    # Get pj project
    && git clone -b pjproject-2.4.5 --depth 1 https://github.com/asterisk/pjproject.git \
    # Build pj project
    && cd pjproject \
    && ./configure \
            --prefix=/usr \
            --libdir=/usr/lib64 \
            --enable-shared \
            --disable-sound \
            --disable-resample \
            --disable-video \
            --disable-opencore-amr \
                    1> /dev/null \
    && make -j$(nproc) dep 1> /dev/null \
    && make -j$(nproc) 1> /dev/null \
    && make -j$(nproc) install \
    && ldconfig \
    && ldconfig -p | grep pj \
    && cd .. \
    # Download asterisk.
    && git clone -b certified/13.8 --depth 1 https://gerrit.asterisk.org/asterisk \
    && cd asterisk \
    # Configure
    && ./configure \
            --libdir=/usr/lib64 \
                    1> /dev/null \
    # Remove the native build option
    # from: https://wiki.asterisk.org/wiki/display/AST/Building+and+Installing+Asterisk
    && make -j$(nproc) menuselect.makeopts \
    && menuselect/menuselect \
                  --disable BUILD_NATIVE \
                  --enable cdr_csv \
                  --enable chan_sip \
                  --enable res_snmp \
                  --enable res_http_websocket \
                  --enable res_hep_pjsip \
                  --enable res_hep_rtcp \
          menuselect.makeopts \
    # Continue with a standard make.
    && make -j$(nproc) 1> /dev/null \
    && make -j$(nproc) install 1> /dev/null \
    && make -j$(nproc) samples 1> /dev/null \
    && make dist-clean \
    # Update max number of open files.
    && sed -i -e 's/# MAXFILES=/MAXFILES=/' /usr/sbin/safe_asterisk \
    # Create and configure asterisk for running asterisk user.
    && useradd -m asterisk -s /sbin/nologin \
    && chown -R asterisk:asterisk /var/run/asterisk \
                                  /etc/asterisk/ \
                                  /var/lib/asterisk \
                                  /var/log/asterisk \
                                  /var/spool/asterisk \
                                  /usr/lib64/asterisk/

# And run asterisk in the foreground.
USER asterisk
CMD /usr/sbin/asterisk -f