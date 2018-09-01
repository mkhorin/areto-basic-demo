'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredFileCleaner extends Base {

    constructor (config) {
        super(Object.assign({
            timeout: 60 * 60,
            File: require('../../model/File')
        }, config));
    }

    async run () {
        let query = this.File.findExpired(this.timeout);
        let models = await query.all();
        let counter = await this.File.removeBatch(models);
        return `${counter} files have been removed`;
    }
};
module.exports.init(module);