'use strict';

require('areto/helpers/init');

let app = require('../module');
let helper = require('areto/helpers/main');

app.configure('development', err => {
    err || app.migrate(helper.getScriptArgs(), err => {
        process.exit();
    });
});