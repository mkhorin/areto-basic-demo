'use strict';

const Base = require('areto/base/Base');

module.exports = class LoginByEmail extends Base {

    constructor (config) {
        super({
            // email: [email]
            // password: [password]
            // rememberMe: [true]
            // user: [WebUser]
            rememberPeriod: 7 * 24 * 3600,
            failedMessage: 'Invalid authentication',
            bannedMessage: 'This account is banned',
            User,
            ...config
        });
    }

    async login () {
        let result = await this.getIdentity();
        if (!result.error) {
            await this.user.login(result.identity, this.getRememberPeriod());
        }
        return result;
    }

    async getIdentity () {
        let error = null;
        let identity = await this.spawn(this.User).findByEmail(this.email).one();
        if (!identity || !identity.validatePassword(this.password)) {
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