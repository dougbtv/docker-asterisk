FROM google/nodejs

RUN npm install -g forever
WORKDIR /app
ADD package.json /app/
RUN npm install
ADD *.js /app/

ENTRYPOINT ["forever", "-o", "/dev/null", "app.js"]