'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredSessionCleaner extends Base {

    async run () {
        await this.module.get('session').removeExpired();
    }
};
module.exports.init(module);