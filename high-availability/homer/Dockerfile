# build as: dougbtv/homer-base
# A base-image for homer.
# (it's a got a ton of deps.)

FROM centos:centos7
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-22

# Deps from: https://github.com/sipcapture/homer/blob/master/scripts/extra/homer_installer.sh
# Removed: mysql-server
RUN yum install -y autoconf automake bzip2 cpio curl curl-devel curl-devel \
                   expat-devel fileutils make gcc gcc-c++ gettext-devel gnutls-devel openssl \
                   openssl-devel openssl-devel mod_ssl perl patch unzip wget zip zlib zlib-devel \
                   bison flex mysql mysql-devel pcre-devel libxml2-devel sox httpd php php-gd php-mysql php-json

# REAL_PATH=/usr/local/kamailio
