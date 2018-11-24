'use strict';

// cd /areto-basic-demo
// node bin/migrate --action apply --file migration/Init

(async ()=> {
    const application = require('../module');
    const SystemHelper = require('areto/helper/SystemHelper');
    try {
        let data = SystemHelper.parseArguments(process.argv);
        await application.init();
        await application.migrate(data.action, data.file);
    } catch (err) {
        application.log('error', 'Migration error', err);
    }
    process.exit();
})();