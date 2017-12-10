'use strict';

const Base = require('areto/web/UserIdentity');

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
            }
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
        return security.validatePassword(password, this.get('passwordHash'));
    }

    setPasswordHash () {
        if (this.get('password')) {
            this.set('passwordHash', security.encryptPassword(this.get('password')));    
        }
    }
};
module.exports.init(module);

const async = require('async');
const security = require('areto/helpers/SecurityHelper');