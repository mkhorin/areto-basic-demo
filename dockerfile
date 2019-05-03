FROM node:12-alpine

WORKDIR /app

COPY . .

RUN npm install --quiet

EXPOSE 8888

ENV NODE_ENV production