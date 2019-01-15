'use strict';

// cd /areto-basic-demo
// node bin/init --action apply --file migration/Init

(async ()=> {
    const application = require('../module');
    const SystemHelper = require('areto/helper/SystemHelper');
    const Migrator = require('areto/db/Migrator');
    try {
        let data = SystemHelper.parseArguments(process.argv);
        await application.init();
        let migrator = new Migrator({
            'module': application
        });
        await migrator.migrate(data.action, data.file);
    } catch (err) {
        application.log('error', 'Migration error', err);
    }
    process.exit();
})();