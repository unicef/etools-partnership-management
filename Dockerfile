FROM mhart/alpine-node:7
RUN apk update
ADD bower.json /tmp
ADD package.json /tmp
WORKDIR /tmp
RUN apk add git
RUN npm install -g bower polymer-cli http-server
RUN npm install
RUN bower --allow-root install
RUN npm install -g gulp-cli
RUN mkdir /code/
ADD . /code/
WORKDIR /code
RUN cp -a /tmp/node_modules /code/node_modules
RUN cp -a /tmp/bower_components /code/bower_components
RUN gulp
EXPOSE 8080
CMD ["node", "express.js"]
