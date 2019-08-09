'use strict';

// cd /areto-basic-demo
// node console/start

const Application = require('../Application');
const application = new Application;

(async ()=> {
    try {
        await application.init();
        await application.start();
    } catch (err) {
        application.log('error', err);
        process.exit();
    }
})();