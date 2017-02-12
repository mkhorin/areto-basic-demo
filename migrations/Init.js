'use strict';

const Base = require('areto/db/Migration');
const User = require('../models/User');

module.exports = class Init extends Base {
   
    apply (cb) {
        this.execute(cb, [
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
        ]);
    }
};
module.exports.init(module);