'use strict';

const app = require('../module');
const MainHelper = require('areto/helpers/MainHelper');

app.configure('development', err => {
    if (err) {
        return console.error(err);
    }
    app.migrate(MainHelper.getScriptArgs(), err => {
        process.exit();
    });
});