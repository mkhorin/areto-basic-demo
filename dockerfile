FROM node:10.9-alpine

WORKDIR /app

COPY . .

RUN npm install --quiet

RUN apk add graphicsmagick

EXPOSE 8888

ENV NODE_ENV production