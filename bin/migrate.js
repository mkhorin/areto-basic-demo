'use strict';

// cd /areto-basic-demo
// node bin/migrate --action apply --classes migrations/Init

const app = require('../module');
const async = require('areto/helper/AsyncHelper');
const CommonHelper = require('areto/helper/CommonHelper');

async.series([
    cb => app.configure('development', cb),
    cb => {
        let data = CommonHelper.parseArguments(process.argv);
        app.migrate(data.action, data.classes, cb);
    }
], err => {
    err && console.error(err);
    process.exit();
});