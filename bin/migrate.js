'use strict';

const async = require('async');
const app = require('../module');
const MiscHelper = require('areto/helpers/MiscHelper');

// cd /areto-basic-demo
// node bin/migrate --action apply --classes migrations/Init

async.series([
    cb => app.configure('development', cb),
    cb => {
        let data = MiscHelper.parseArguments(process.argv);
        app.migrate(data.action, data.classes, cb);
    }
], err => {
    err && console.error(err);
    process.exit();
});