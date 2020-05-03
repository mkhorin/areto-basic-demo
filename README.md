# Blog App

Multi-user blog management application built on Areto Framework  

## Docker installation

Clone application to /app
```sh
cd /app
docker-compose build
docker-compose up -d mongo
docker-compose up -d
```
Usage - http://localhost:8888

Or get Docker Toolbox IP address
```sh
docker-machine ip default
```
Usage - http://{dockerIP}:8888
```sh
Email: a@a.a
Password: 123456
```

## Typical installation

Install environment
- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/download-center/community)

### Linux
Clone application to /app
```sh
cd /app
npm install
NODE_ENV=development npm run init
NODE_ENV=development npm run start
```

### Windows
Clone application to c:/app
```sh
cd c:/app
npm install
set NODE_ENV=development
npm run init
npm run start
```

Usage - http://localhost:3000
```sh
Email: a@a.a
Password: 123456
```   

## Tutorial
- [Build a Blog with Areto Framework](http://nervebit.com/areto/blog/)