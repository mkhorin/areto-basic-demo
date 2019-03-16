'use strict';

// cd /areto-basic-demo
// node console/start

(async ()=> {
    const application = require('../module');
    try {
        await application.init();
        await application.start();
    } catch (err) {
        application.log('error', err);
        process.exit();
    }
})();