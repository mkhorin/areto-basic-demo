FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install --quiet

RUN apk add ttf-freefont

EXPOSE 8888

ENV NODE_ENV production