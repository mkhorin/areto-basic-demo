'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class RateLimit extends Base {

    static getConstants () {
        return {
            TABLE: 'rate_limit',
            STORED_ATTRS: [
                'ip',
                'type',
                'counter'
            ],
            RATE_LIMIT: 3
        };
    }

    static findByIp (type, ip, cb) {
        this.find({ip, type}).one((err, model)=> {
            if (!model) {
                model = new this;
                model.set('type', type);
                model.set('ip', ip);
                model.set('counter', 0);
            }
            cb(err, model);
        });
    }

    isExceeded () {
        return this.get('counter') > this.RATE_LIMIT;
    }

    increment () {
        this.set('counter', this.get('counter') + 1);
        this.forceSave(()=>{});
    }

    reset () {
        this.set('counter', 0);
        this.forceSave(()=>{});
    }
};
module.exports.init(module);