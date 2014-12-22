# Homer - Web App Server
# The reset is setup -- this, this is Homer.

FROM dougbtv/homer-base
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-22

# Clone 'er
RUN git clone --depth 1 https://github.com/sipcapture/homer/ /homer

# Get the webroot set up
# ...and copy the configs.
ENV WEBROOT /var/www/html
RUN cp -R /homer/webhomer $WEBROOT/
COPY configuration.php /var/www/html/webhomer/configuration.php
COPY preferences.php /var/www/html/webhomer/preferences.php

# Get the apache config in place.
COPY vhost.conf /etc/httpd/conf.d/000-homer.conf

# Setup our entrypoint.
COPY run.sh /run.sh