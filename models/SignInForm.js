'use strict';

const Base = require('areto/base/Model');
const User = require('./User');

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
                ['password', 'string', {min: 6, max:24}]
            ],
            LABELS: {
                rememberMe: 'Remember me',
                captchaCode: 'Verification code'
            }
        };
    }

    init () {
        super.init();
        if (!this.rateLimit || this.rateLimit.isExceeded()) {
            this.scenario = CAPTCHA_SCENARIO;
        }
    }

    isCaptchaRequired () {
        return this.scenario === CAPTCHA_SCENARIO;
    }

    login (webuser, cb) {
        this.validate(err => {
            err || this.hasError() ? cb(err) : this.checkUser(webuser, cb)
        });
    }

    checkUser (webuser, cb) {
        User.find({email: this.get('email')}).one((err, model)=> {
            if (model) {
                if (model.validatePassword(this.get('password'))) {
                    if (model.isBanned()) {
                        this.addError('email', 'This account banned');
                    }
                } else {
                    this.addError('password', 'Invalid authentication');
                }
            } else {
                this.addError('password', 'Invalid authentication');
            }
            if (this.rateLimit) {
                if (this.hasError()) {
                    this.rateLimit.increment();
                } else if (this.isCaptchaRequired()) {
                    this.rateLimit.reset();
                }
            }
            this.hasError() ? cb()
                : webuser.login(model, this.get('rememberMe') ? REMEMBER_PERIOD : 0, cb);
        });
    }
};
module.exports.init(module);