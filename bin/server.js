'use strict';

// cd /areto-basic-demo
// node bin/server

(async ()=> {
    const application = require('../module');
    try {
        await application.init(process.env.NODE_ENV);
        await application.start();
    } catch (err) {
        application.log('error', err);
        process.exit();
    }
})();