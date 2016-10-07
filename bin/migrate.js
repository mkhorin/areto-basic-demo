'use strict';

require('areto/helpers/init');

let app = require('../module');
let helper = require('areto/helpers/Main');

app.configure('development', err => {
    err || app.migrate(helper.getScriptArgs(), err => {
        process.exit();
    });
});