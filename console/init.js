'use strict';
/**
 * Initialize app
 *
 * cd /areto-basic-demo
 * node console/init --action apply --file migration/Init
 */
const SystemHelper = require('areto/helper/SystemHelper');
const Migrator = require('areto/db/Migrator');
const Application = require('../Application');
const application = new Application;

(async ()=> {
    try {
        const data = SystemHelper.parseArguments(process.argv);
        await application.init();
        const migrator = new Migrator({module: application});
        await migrator.migrate(data.action, data.file);
    } catch (err) {
        application.log('error', 'Migration failed:', err);
    }
    process.exit();
})();