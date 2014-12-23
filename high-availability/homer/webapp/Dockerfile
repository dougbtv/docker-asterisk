# Homer - Web App Server
# The reset is setup -- this, this is Homer.

FROM dougbtv/homer-base
MAINTAINER Doug Smith <info@laboratoryb.org>
ENV build_date 2014-12-22

# Clone 'er
RUN git clone --depth 1 https://github.com/sipcapture/homer/ /homer

# Get the webroot set up
# ...and copy the configs.
RUN cp -R /homer/webhomer /var/www/html/
RUN chmod -R 0777 /var/www/html/webhomer/tmp
COPY configuration.php /var/www/html/webhomer/configuration.php
COPY preferences.php /var/www/html/webhomer/preferences.php

# Get the apache config in place.
COPY vhost.conf /etc/httpd/conf.d/000-homer.conf

# Setup our entrypoint.
COPY run.sh /run.sh

ENTRYPOINT [ "/run.sh" ]