# Areto Basic Demo App 

### Install the  environment
- [Node.js](https://nodejs.org)
- [MongoDB](https://www.mongodb.com)
- [Graphics Magick](http://www.graphicsmagick.org)

### Linux
Clone application to /areto-basic-demo
```sh
cd /areto-basic-demo
npm install
NODE_ENV=development node bin/migrate --action apply --classes migrations/Init
NODE_ENV=development node bin/server
```

### Windows
Clone application to c:/areto-basic-demo
```sh
cd /d c:/areto-basic-demo
npm install
set NODE_ENV=development
node bin/migrate --action apply --classes migrations/Init
node bin/server
```

### Go!
http://localhost:3000

Admin module
```sh
Email: a@a.a
Password: 123456
```   

### Tutorial
- [Build a blog with Areto framework](http://nervebit.com/areto/blog/)

