'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class User extends Base {

    static getConstants () {
        return {
            TABLE: 'user',
            ATTRS: [
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
                'timestamp': require('areto/behavior/TimestampBehavior')
            },
            STATUS_PENDING: 'penging',
            STATUS_ACTIVE: 'active',
            STATUS_BANNED: 'banned',
            ROLE_READER: 'reader',
            ROLE_AUTHOR: 'author',
            ROLE_EDITOR: 'editor',
            ROLE_MODERATOR: 'moderator',
            ROLE_ADMIN: 'admin',
            AUTH_KEY_LENGTH: 16
        };
    }

    static findIdentity (id) {
        return this.findById(id).and({
            status: this.STATUS_ACTIVE
        });
    }

    static findByEmail (email) {
        return this.find({email});
    }

    init () {
        super.init();
        this.set('role', this.ROLE_AUTHOR);
        this.set('status', this.STATUS_ACTIVE);
    }

    getTitle () {
        return this.get('name');
    }
    
    isActive () {
        return this.get('status') === this.STATUS_ACTIVE;
    }

    isBanned () {
        return this.get('status') === this.STATUS_BANNED;
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
        let password = this.get('password');
        if (password) {
            this.set('passwordHash', SecurityHelper.encryptPassword(password));
        }
    }

    // AUTH KEY to remember me cookies

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

const async = require('areto/helper/AsyncHelper');
const SecurityHelper = require('areto/helper/SecurityHelper');