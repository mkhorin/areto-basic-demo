'use strict';

const Base = require('areto/db/Migration');

module.exports = class Init extends Base {
   
    apply (cb) {
        async.series([
            cb => this.db.createIndex('user', [{email: 1}, {unique: true}], cb),
            cb => {
                let user = new User;
                user.setAttrs({
                    name: 'Administrator',
                    email: 'a@a.a',
                    role: 'admin',
                    password: '123456'
                });
                user.save(cb);
            }
        ], cb);
    }
};
module.exports.init(module);

const async = require('areto/helpers/AsyncHelper');
const User = require('../models/User');
