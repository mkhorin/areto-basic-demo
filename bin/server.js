'use strict';

const app = require('../module');
const async = require('areto/helpers/AsyncHelper');

// cd /areto-basic-demo
// node bin/server

async.series([
    cb => app.configure(process.env.NODE_ENV, cb),
    cb => app.start(cb)
], err => {
    err && console.error(err);
});