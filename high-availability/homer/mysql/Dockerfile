FROM mysql:5.6
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-22

WORKDIR /
RUN mkdir /sql
COPY sql/ /sql
COPY load_data.sh /load_data.sh