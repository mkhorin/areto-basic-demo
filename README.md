# Simple demo blog using Areto Framework

## Docker installation

### Build from Dockerfile
Clone application to /areto-basic-demo
```sh
cd /areto-basic-demo
docker-compose build
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
- [Graphics Magick](http://www.graphicsmagick.org)

### Linux
Clone application to /areto-basic-demo
```sh
cd /areto-basic-demo
npm install
NODE_ENV=development node bin/migrate --action apply --file migration/Init
NODE_ENV=development node bin/server
```

### Windows
Clone application to c:/areto-basic-demo
```sh
cd /d c:/areto-basic-demo
npm install
set NODE_ENV=development
node bin/migrate --action apply --file migration/Init
node bin/server
```

### Usage
http://localhost:3000
```sh
Email: a@a.a
Password: 123456
```   

## Tutorial
- [Build a blog with Areto Framework](http://nervebit.com/areto/blog/)