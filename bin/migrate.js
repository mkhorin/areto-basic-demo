'use strict';

// cd /areto-basic-demo
// node bin/migrate --action apply --file migrations/Init

(async ()=> {
    const application = require('../module');
    const CommonHelper = require('areto/helper/CommonHelper');
    try {
        let data = CommonHelper.parseArguments(process.argv);
        await application.init('development');
        await application.migrate(data.action, data.file);
    } catch (err) {
        application.log('error', 'Migration error', err);
    }
    process.exit();
})();