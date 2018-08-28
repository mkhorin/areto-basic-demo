'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredSessionCleaner extends Base {

    async run () {
        await this.module.components.session.removeExpired();
    }
};
module.exports.init(module);