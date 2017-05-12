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
        async.waterfall([
            cb => this.find({ip, type}).one(cb),
            (model, cb)=> {
                cb(null, model ? model : new this({type, ip, counter: 0}));
            }
        ], cb);
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

const async = require('async');