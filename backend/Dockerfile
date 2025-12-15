FROM node:25-alpine3.22

WORKDIR /app

COPY package.json /app/
COPY server.js /app/

RUN npm install

CMD ["node","server.js"]
