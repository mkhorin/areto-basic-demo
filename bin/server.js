'use strict';

let app = require('../module');

app.configure(process.env.NODE_ENV, err => {
    err || app.start(err => {});
});

