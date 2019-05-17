'use strict';

// cd /areto-basic-demo
// node console/init --action apply --file migration/Init

const SystemHelper = require('areto/helper/SystemHelper');
const Migrator = require('areto/db/Migrator');
const Application = require('../Application');
const application = new Application;

(async ()=> {
    try {
        let data = SystemHelper.parseArguments(process.argv);
        await application.init();
        let migrator = new Migrator({module: application});
        await migrator.migrate(data.action, data.file);
    } catch (err) {
        application.logError('Migration error', err);
    }
    process.exit();
})();