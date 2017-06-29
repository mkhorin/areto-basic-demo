'use strict';

const Base = require('areto/base/Task');

module.exports = class SessionCleaner extends Base {

    run (cb) {
        try {
            this.module.components.session.removeExpired(cb);
        } catch (err) {
            cb(err);
        }
    }
};
module.exports.init(module);