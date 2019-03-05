FROM node:11.9.0-alpine
RUN apk update
RUN apk add --update bash

RUN apk add git
RUN npm install -g --unsafe-perm polymer-cli
RUN npm install -g typescript


WORKDIR /tmp
ADD package.json /tmp/

RUN npm install

RUN mkdir /code/
ADD . /code/
WORKDIR /code
RUN cp -a /tmp/node_modules /code/node_modules

ENV NODE_OPTIONS="--max_old_space_size=4072"
RUN npm run build
EXPOSE 8080
CMD ["node", "express.js"]
