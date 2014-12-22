# Homer - SIP Capture server
# ...Which is a fancy-ass Kamailio, when it comes down to it

FROM dougbtv/homer-base
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-22

# Clone the source
RUN mkdir -p /usr/src/
WORKDIR /usr/src/
RUN git clone -b 4.2 --depth 1 https://github.com/kamailio/kamailio.git kamailio
WORKDIR /usr/src/kamailio
RUN git checkout 4.2
ENV REAL_PATH /usr/local/kamailio

# Get ready for a build.
RUN make PREFIX=$REAL_PATH FLAVOUR=kamailio include_modules="db_mysql sipcapture pv textops rtimer xlog sqlops htable sl siputils" cfg
RUN make all && make install
RUN mv $REAL_PATH/etc/kamailio/kamailio.cfg $REAL_PATH/etc/kamailio/kamailio.cfg.old
RUN cp modules/sipcapture/examples/kamailio.cfg $REAL_PATH/etc/kamailio/kamailio.cfg

WORKDIR /

# Get the configs in there
RUN mkdir -p /etc/kamailio
COPY kamailio.cfg /etc/kamailio/kamailio.cfg
COPY run.sh /run.sh
ENTRYPOINT [ "/run.sh" ]