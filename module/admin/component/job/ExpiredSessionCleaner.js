'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredSessionCleaner extends Base {

    run () {
        this.module.components.session.removeExpired(err => {
            this.complete(err);
        });
    }
};
module.exports.init(module);