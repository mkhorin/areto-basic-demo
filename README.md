# Simple blog made by Areto Framework

## Docker installation

### Build from Dockerfile
Clone application to /areto-basic-demo
```sh
cd /areto-basic-demo
docker-compose build
docker-compose up -d mongo
docker-compose up -d
```

### Usage
http://{YourDockerIP}:8888
```sh
Email: a@a.a
Password: 123456
```

## Typical installation

### Install the environment
- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com)

### Linux
Clone application to /areto-basic-demo
```sh
cd /areto-basic-demo
npm install
NODE_ENV=development npm run init
NODE_ENV=development npm run start
```

### Windows
Clone application to c:/areto-basic-demo
```sh
cd /d c:/areto-basic-demo
npm install
set NODE_ENV=development
npm run init
npm run start
```

### Usage
http://localhost:3000
```sh
Email: a@a.a
Password: 123456
```   

## Tutorial
- [Build a blog with Areto Framework](http://nervebit.com/areto/blog/)