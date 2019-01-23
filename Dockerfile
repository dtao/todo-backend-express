FROM node:10-alpine

ENV PORT=5000

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

CMD [ "node", "server.js" ]
