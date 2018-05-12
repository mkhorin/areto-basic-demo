'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class User extends Base {

    static getConstants () {
        return {
            TABLE: 'user',
            STORED_ATTRS: [
                'name', 
                'email', 
                'role', 
                'status',
                'createdAt',
                'updatedAt',
                'passwordHash', 
                'authKey'
            ],
            BEHAVIORS: {
                'timestamp': require('areto/behaviors/TimestampBehavior')
            },
            AUTH_KEY_LENGTH: 16
        };
    }

    static findIdentity (id) {
        return this.findById(id).and({
            status: 'active'
        });
    }

    init () {
        super.init();
        this.set('role', 'author');
        this.set('status', 'active');
    }

    getTitle () {
        return this.get('name');
    }
    
    isActive () {
        return this.get('status') === 'active';
    }

    isBanned () {
        return this.get('status') === 'banned';
    }

    getAssignments (cb) {
        cb(null, [this.get('role')]);
    }

    // EVENTS

    beforeSave (insert, cb) {
        async.series([
            cb => super.beforeSave(insert, cb),
            cb => {
                this.setPasswordHash();
                insert ? this.setAuthKey(cb) : cb();
            }
        ], cb);
    }
   
    // PASSWORD

    validatePassword (password) {
        return SecurityHelper.validatePassword(password, this.get('passwordHash'));
    }

    setPasswordHash () {
        if (this.get('password')) {
            this.set('passwordHash', SecurityHelper.encryptPassword(this.get('password')));
        }
    }

    // AUTH key to remember me cookies

    validateAuthKey (key) {
        return this.getAuthKey() === key;
    }

    getAuthKey () {
        return this.get('authKey');
    }

    setAuthKey (cb) {
        async.waterfall([
            cb => SecurityHelper.generateRandomString(this.AUTH_KEY_LENGTH, cb),
            (result, cb)=> {
                this.set('authKey', result);
                cb();
            }
        ], cb);
    }
};
module.exports.init(module);

const async = require('areto/helpers/AsyncHelper');
const SecurityHelper = require('areto/helpers/SecurityHelper');