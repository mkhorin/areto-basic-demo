'use strict';

const Base = require('areto/base/Base');

module.exports = class PasswordAuthService extends Base {

    /**
     * @param {Object} config
     * @param {string} config.email
     * @param {string} config.password
     * @param {boolean} config.rememberMe
     * @param {Object} config.user - WebUser instance
     */
    constructor (config) {
        super({
            rememberPeriod: 7 * 24 * 3600,
            failedMessage: 'Invalid authentication',
            bannedMessage: 'This account has been suspended',
            User,
            ...config
        });
    }

    async login () {
        const {identity, error} = await this.getIdentityData();
        if (error) {
            return error;
        }
        await this.user.login({
            identity,
            duration: this.getRememberPeriod()
        });
    }

    async getIdentityData () {
        const identity = await this.spawn(this.User).findByEmail(this.email).one();
        let error = null;
        if (!identity || !identity.checkPassword(this.password)) {
            error = this.failedMessage;
        } else if (identity.isBanned()) {
            error = this.bannedMessage;
        }
        return {identity, error};
    }

    getRememberPeriod () {
        return this.rememberMe ? this.rememberPeriod : 0;
    }
};
module.exports.init();

const User = require('../../model/User');