'use strict';

const Base = require('areto/base/Module');

module.exports = class Admin extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                'access': {
                    Class: require('areto/filter/AccessControl'),
                    rules: [{
                        allow: true,
                        roles: ['reader']
                    }]
                }
            }
        };
    }

    afterComponentInit (cb) {
        async.series([
            cb => this.addSchedulerTasks(cb),
            cb => super.afterComponentInit(cb)
        ], cb);
    }

    addSchedulerTasks (cb) {
        this.components.scheduler.addTasks(this.config.tasks);
        setImmediate(cb);
    }
};
module.exports = new (module.exports.init(module));

const async = require('areto/helper/AsyncHelper');