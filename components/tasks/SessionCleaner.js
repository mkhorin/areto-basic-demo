'use strict';

let Base = require('areto/base/Task');

module.exports = class SessionCleaner extends Base {

    constructor (config) {
        super(Object.assign({
            elapsedSeconds: 3600
        }, config))
    }

    run (cb) {
        try {
            this.module.components.session.removeExpired(this.elapsedSeconds, cb);    
        } catch (err) {
            cb(err);
        }
    }
};
module.exports.init(module);