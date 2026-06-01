FROM node:22-alpine

WORKDIR /app

COPY package.json /app/
COPY server.js /app/

RUN npm install

CMD ["node", "server.js"]
