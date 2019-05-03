'use strict';

const Base = require('areto/base/Application');

module.exports = class Basic extends Base {

    constructor (config) {
        super ({
            ...config
        });
    }
};
module.exports.init(module);