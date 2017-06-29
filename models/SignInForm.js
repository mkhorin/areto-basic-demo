'use strict';

const Base = require('areto/base/Model');

const CAPTCHA_SCENARIO = 'captcha';
const REMEMBER_PERIOD = 3600 * 24 * 7;

module.exports = class SignInForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['email', 'password'], 'required'],
                ['email', 'email'],
                ['rememberMe', 'boolean'],
                ['captchaCode', 'required', {on: [CAPTCHA_SCENARIO]}],
                ['captchaCode', require('areto/captcha/CaptchaValidator'), {
                    CaptchaController: require('../controllers/AuthController'),
                    on: [CAPTCHA_SCENARIO]
                }],
                ['password', 'string', {min: 6, max:24}],
                ['email', 'validateUser', {skipOnAnyError: true}]
            ],
            LABELS: {
                rememberMe: 'Remember me',
                captchaCode: 'Verification code'
            }
        };
    }

    init () {
        super.init();
        this.setCaptchaScenario();
    }

    setCaptchaScenario () {
        if (!this.rateLimitModel || this.rateLimitModel.isLimited()) {
            this.scenario = CAPTCHA_SCENARIO;
        }
    }

    isCaptchaRequired () {
        return this.scenario === CAPTCHA_SCENARIO;
    }

    validateUser (cb, attrName) {
        async.waterfall([
            cb => {
                User.find({
                    email: this.get('email')
                }).one(cb);
            },
            (model, cb)=> {
                if (!model || !model.validatePassword(this.get('password'))) {
                    this.addError(attrName, 'Invalid authentication');
                } else if (model.isBanned()) {
                    this.addError(attrName, 'This account is banned');
                }
                this.identity = model;
                cb();
            }
        ], cb);
    }

    login (user, cb) {
        async.series([
            cb => this.validate(cb),
            cb => this.identity === undefined ? cb() : this.updateRateLimit(cb),
            cb => {
                this.setCaptchaScenario();
                this.hasError() ? cb()
                    : user.login(this.identity, this.get('rememberMe') ? REMEMBER_PERIOD : 0, cb);
            }
        ], cb);
    }

    updateRateLimit (cb) {
        if (this.rateLimitModel) {
            if (this.hasError()) {
                return this.rateLimitModel.increment(cb);
            }
            if (this.isCaptchaRequired()) {
                return this.rateLimitModel.reset(cb);
            }
        }
        cb();
    }
};
module.exports.init(module);

const async = require('async');
const User = require('./User');