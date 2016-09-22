'use strict';

let Base = require('areto/web/UserIdentity');
let security = require('areto/helpers/security');

module.exports = class User extends Base {

    static getConstants () {
        return {
            TABLE: 'user',
            STORED_ATTRIBUTES: [
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
                timestamp: require('areto/behaviors/Timestamp')
            }
        };
    }

    static findIdentity (id) {
        return this.findById(id).andWhere({status: 'active'});
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
   
    // EVENTS

    beforeSave (cb, insert) {
        super.beforeSave(err => {
            if (err) {
                return cb(err);
            }
            this.setPasswordHash();
            if (insert) {
                this.setAuthKey(cb)
            } else {
                cb();    
            }   
        }, insert);
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