'use strict';

const Base = require('areto/base/Module');

class Admin extends Base {

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


}
module.exports = new (Admin.init(module));