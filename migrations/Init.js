'use strict';

let Base = require('areto/db/Migration');
let User = require('../models/User');

module.exports = class Init extends Base {
   
    apply (cb) {
        this.execute(cb, [
            cb => this.db.createIndex('user', [{email: 1}, {unique: true}], cb),
            cb => {
                let user = new User;
                user.setAttributes({
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