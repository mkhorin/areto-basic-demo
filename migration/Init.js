'use strict';

const Base = require('areto/db/Migration');

module.exports = class Init extends Base {
   
    async apply () {
        await this.db.createIndex('user', [{email: 1}, {unique: true}]);
        let user = new User;
        user.setAttrs({
            name: 'Administrator',
            email: 'a@a.a',
            role: 'admin',
            password: '123456'
        });
        await user.save();
    }
};
module.exports.init(module);

const User = require('../model/User');
