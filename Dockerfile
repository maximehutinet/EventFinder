FROM node:12.13-stretch-slim

COPY . /server/

WORKDIR /server

RUN npm update && npm install

CMD npm start

EXPOSE 8080
