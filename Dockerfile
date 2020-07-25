FROM centos:centos7
LABEL maintainer='Doug Smith <info@laboratoryb.org>' contributors='Christophe Langenberg <christophe@langenberg.be>'
ENV build_date 2016-05-14
ENV AUTOBUILD_UNIXTIME 1418234402
ENV rebuild_date 2015-05-15

RUN yum update -y \
    && yum install -y \
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
                make \
                git \
    && yum clean all \
    && cd /tmp \
    # Download asterisk.
    && git clone -b certified/11.6 --depth 1 https://gerrit.asterisk.org/asterisk \
    && cd asterisk \
    # make asterisk.
    # Configure
    && ./configure --libdir=/usr/lib64 1> /dev/null \
    # Remove the native build option
    && make -j$(nproc) menuselect.makeopts \
    && menuselect/menuselect \
                          --disable BUILD_NATIVE \
                          --enable cdr_csv \
                          --enable chan_sip \
                          --enable res_snmp \
                          --enable res_http_websocket \
                      menuselect.makeopts \
    # Continue with a standard make.
    && make -j$(nproc) 1> /dev/null \
    && make -j$(nproc) install 1> /dev/null \
    && make -j$(nproc) samples 1> /dev/null \
    # clean up the cached make files
    && make dist-clean \
    # Update max number of open files.
    && sed -i -e 's/# MAXFILES=/MAXFILES=/' /usr/sbin/safe_asterisk \
    # Set tty
    && sed -i 's/TTY=9/TTY=/g' /usr/sbin/safe_asterisk \
    # Create and configure asterisk for running asterisk user.
    && useradd -m asterisk -s /sbin/nologin \
    && chown -R asterisk:asterisk /var/run/asterisk \
                                  /etc/asterisk/ \
                                  /var/lib/asterisk \
                                  /var/log/asterisk \
                                  /var/spool/asterisk \
                                  /usr/lib64/asterisk/

# Running asterisk with user asterisk.
USER asterisk
CMD /usr/sbin/asterisk -fvvvvv
