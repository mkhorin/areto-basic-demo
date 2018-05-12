'use strict';

const async = require('areto/helpers/AsyncHelper');
const CommonHelper = require('areto/helpers/CommonHelper');
const app = require('../module');

// cd /areto-basic-demo
// node bin/migrate --action apply --classes migrations/Init

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