'use strict';

// cd /areto-basic-demo
// node bin/server

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