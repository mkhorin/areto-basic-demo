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
            STATUS_PENDING: 'pending',
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

    constructor (config) {
        super(config);
        this.set('role', this.ROLE_AUTHOR);
        this.set('status', this.STATUS_ACTIVE);
    }

    findIdentity (id) {
        return this.findById(id).and({status: this.STATUS_ACTIVE});
    }

    findByEmail (email) {
        return this.find({email});
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

    getAssignments () {
        return [this.get('role')];
    }

    // EVENTS

    async beforeSave (insert) {
        await super.beforeSave(insert);
        this.setPasswordHash();
        if (insert) {
            this.setAuthKey();
        }
    }

    // PASSWORD

    checkPassword (password, hash) {
        return SecurityHelper.checkPassword(password, hash || this.get('passwordHash'));
    }

    setPasswordHash () {
        const password = this.get('password');
        if (password) {
            this.set('passwordHash', SecurityHelper.hashPassword(password));
        }
    }

    // AUTH KEY (remember me cookies)

    getAuthKey () {
        return this.get('authKey');
    }

    setAuthKey () {
        this.set('authKey', SecurityHelper.getRandomString(this.AUTH_KEY_LENGTH));
    }

    checkAuthKey (key) {
        return this.getAuthKey() === key;
    }
};
module.exports.init(module);

const SecurityHelper = require('areto/helper/SecurityHelper');