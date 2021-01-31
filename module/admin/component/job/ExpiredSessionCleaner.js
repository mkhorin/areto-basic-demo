'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredSessionCleaner extends Base {

    async execute () {
        await this.module.get('session').deleteExpired();
    }
};
module.exports.init(module);