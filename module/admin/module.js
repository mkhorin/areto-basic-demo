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

    async afterComponentInit () {
        await this.addSchedulerTasks();
        await super.afterComponentInit();
    }

    addSchedulerTasks () {
        this.get('scheduler').addTasks(this.getConfig('tasks'));
    }
};
module.exports = new (module.exports.init(module));