# ---------------------------------------------------
# An service discovery tool for Kamailio
# Both announces and dispatches based on etcd.
# ---------------------------------------------------

FROM google/nodejs

MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-19

RUN npm install -g kamailio-etcd-dispatcher

ENTRYPOINT ["etcd-dispatcher"]
