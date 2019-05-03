'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredFileCleaner extends Base {

    constructor (config) {
        super({
            'expirationTimeout': 60 * 60,
            'FileModel': require('../../model/File'),
            ...config
        });
    }

    async run () {
        let query = this.spawn(this.FileModel).findExpired(this.expirationTimeout);
        let models = await query.all();
        let counter = await this.FileModel.removeBatch(models);
        return `${counter} files have been removed`;
    }
};
module.exports.init(module);