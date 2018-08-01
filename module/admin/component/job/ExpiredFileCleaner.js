'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredFileCleaner extends Base {

    constructor (config) {
        super(Object.assign({
            timeout: 60 * 60,
            File: require('../../model/File')
        }, config));
    }

    run () {
        let query = this.File.findExpired(this.timeout);
        async.waterfall([
            cb => query.all(cb),
            (models, cb)=> this.File.removeBatch(models, cb)
        ], (err, counter)=> {
            this.complete(err, `${counter} files have been removed`);
        });
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');