# ---------------------------------------------------
# An service discovery tool for Kamailio
# Both announces and dispatches based on etcd.
# ---------------------------------------------------

FROM node

MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2015-10-26

RUN npm install -g kamailio-etcd-dispatcher

ENTRYPOINT ["etcd-dispatcher"]
