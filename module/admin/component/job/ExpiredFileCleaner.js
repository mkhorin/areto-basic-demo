'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class ExpiredFileCleaner extends Base {

    constructor (config) {
        super({
            expirationTimeout: 60 * 60,
            FileModel: require('../../model/File'),
            ...config
        });
    }

    async run () {
        const query = this.spawn(this.FileModel).findExpired(this.expirationTimeout);
        const models = await query.all();
        await this.FileModel.remove(models);
        return `Expired files removed: ${models.length}`;
    }
};
module.exports.init(module);