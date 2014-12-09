# ---------------------------------------------------
# An service discovery tool for Kamailio
# Both announces and dispatches based on etcd.
# ---------------------------------------------------

FROM google/nodejs

MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-08

RUN npm install -g forever
WORKDIR /app
ADD package.json /app/
RUN npm install
ADD *.js /app/

ENTRYPOINT ["forever", "-o", "/dev/null", "app.js"]