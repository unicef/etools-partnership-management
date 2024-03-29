FROM node:12.22.7-alpine3.12 as builder
RUN apk update
RUN apk add --update bash

RUN node -v
RUN npm -v

RUN apk add git

RUN npm install -g --unsafe-perm polymer-cli
RUN npm install -g typescript
# RUN npm install -g @babel/core @babel/cli


WORKDIR /tmp
ADD package.json /tmp/
ADD package-lock.json /tmp/

RUN npm ci

ADD . /code/
WORKDIR /code

RUN cp -a /tmp/node_modules /code/node_modules
# RUN npm run transpileNullCoalescingOp-OptionalChaining
RUN npm run build


FROM node:12.22.7-alpine3.12
RUN apk update
RUN apk add --update bash

WORKDIR /code
RUN npm install express
RUN npm install browser-capabilities@1.1.x
COPY --from=builder /code/express.js /code/express.js
COPY --from=builder /code/build /code/build
EXPOSE 8080
CMD ["node", "express.js"]

