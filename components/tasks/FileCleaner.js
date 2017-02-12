'use strict';

const Base = require('areto/base/Task');
const async = require('async');

module.exports = class FileCleaner extends Base {

    constructor (config) {
        super(Object.assign({
            elapsedSeconds: 3600
        }, config))
    }

    run (cb) {
        try {
            let File = require('../../modules/admin/models/File');
            File.findExpired(this.elapsedSeconds).all((err, models)=> {
                File.removeBatch(models, cb);
            });    
        } catch (err) {
            cb(err);
        }
    }
};
module.exports.init(module);