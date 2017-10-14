'use strict';

const Base = require('areto/base/Module');

module.exports = class Admin extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                'access': {
                    Class: require('areto/filters/AccessControl'),
                    rules: [{
                        allow: true,
                        roles: ['reader']
                    }]
                }
            }
        };
    }
};
module.exports = new (module.exports.init(module));