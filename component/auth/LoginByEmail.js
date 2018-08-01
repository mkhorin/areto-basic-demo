'use strict';

const Base = require('areto/base/Base');

module.exports = class LoginByEmail extends Base {

    constructor (config) {
        super(Object.assign({
            // email:
            // password:
            // rememberMe:
            // user: new WebUser
            rememberPeriod: 7 * 24 * 3600,
            failedMessage: 'Invalid authentication',
            bannedMessage: 'This account is banned',
            User
        }, config));
    }

    login (cb) {
        async.series([
            cb => this.getIdentity(cb),
            cb => this._error ? cb() : this.user.login(this._identity, this.getRememberPeriod(), cb)
        ], err => cb(err, {
            error: this._error,
            identity: this._identity
        }));
    }

    getIdentity (cb) {
        this._identity = null;
        async.waterfall([
            cb => this.User.findByEmail(this.email).one(cb),
            (model, cb)=> {
                if (!model || !model.validatePassword(this.password)) {
                    this._error = this.failedMessage;
                } else if (model.isBanned()) {
                    this._error = this.bannedMessage;
                }
                this._identity = model;
                cb(null, model);
            }
        ], cb);
    }

    getRememberPeriod () {
        return this.rememberMe ? this.rememberPeriod : 0;
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const User = require('../../model/User');