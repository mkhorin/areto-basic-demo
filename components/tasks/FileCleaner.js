'use strict';

const Base = require('areto/base/Task');

module.exports = class FileCleaner extends Base {

    constructor (config) {
        super(Object.assign({
            timeout: 3600 // seconds
        }, config))
    }

    run (cb) {
        try {
            let File = require('../../modules/admin/models/File');
            File.findExpired(this.timeout).all((err, models)=> {
                File.removeBatch(models, cb);
            });    
        } catch (err) {
            cb(err);
        }
    }
};
module.exports.init(module);

const async = require('async');