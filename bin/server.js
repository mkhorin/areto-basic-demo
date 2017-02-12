'use strict';

const app = require('../module');

app.configure(process.env.NODE_ENV, err => {
    if (err) {
        return console.error(err);
    }  
    app.start(err => {});
});

