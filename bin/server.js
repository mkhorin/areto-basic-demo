'use strict';

// cd /areto-basic-demo
// node bin/server

const app = require('../module');
const async = require('areto/helper/AsyncHelper');

async.series([
    cb => app.configure(process.env.NODE_ENV, cb),
    cb => app.start(cb)
], err => {
    err && console.error(err);
});