'use strict';

let app = require('../module');
let helper = require('areto/helpers/MainHelper');

app.configure('development', err => {
    err || app.migrate(helper.getScriptArgs(), err => {
        process.exit();
    });
});