'use strict';

const CAPTCHA_SCENARIO = 'captcha';
const Base = require('areto/base/Model');

module.exports = class SignInForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['email', 'password'], 'required'],
                ['email', 'email'],
                ['password', 'string', {min: 6, max:24}],
                ['rememberMe', 'boolean'],
                ['captchaCode', 'required', {on: [CAPTCHA_SCENARIO]}],
                ['captchaCode', {
                    Class: require('areto/captcha/CaptchaValidator'),
                    on: [CAPTCHA_SCENARIO]
                }]
            ],
            ATTR_LABELS: {
                rememberMe: 'Remember me',
                captchaCode: 'Verification code'
            },
            CAPTCHA_SCENARIO
        };
    }

    constructor (config) {
        super(Object.assign({
            // user: new WebUser
            rateLimit: SignInForm.module.components.rateLimit,
            rateLimitType: 'signIn',
            rememberPeriod: 7 * 24 * 3600
        }, config));
    }

    isCaptchaRequired () {
        return this.scenario === this.CAPTCHA_SCENARIO;
    }

    toggleCaptchaScenario () {
        this.scenario = this._rateLimitModel && this._rateLimitModel.isLimited()
            ? this.CAPTCHA_SCENARIO : null;
    }

    resolveCaptchaScenario (cb) {
        if (!(this.rateLimit instanceof RateLimit)) {
            return cb();
        }
        async.waterfall([
            cb => this.rateLimit.find(this.rateLimitType, this.user, cb),
            (model, cb)=> {
                this._rateLimitModel = model;
                this.toggleCaptchaScenario();
                cb();
            }
        ], cb);
    }

    login (complete) {
        async.series([
            cb => this.validate(cb),
            cb => this.hasError() ? complete() : cb(),
            cb => async.waterfall([
                cb => this.createLoginByEmail().login(cb),
                (result, cb)=> {
                    if (result.error) {
                        this.addError('email', result.error);
                    }
                    this.updateRateLimit(cb);
                },
                cb => {
                    this.toggleCaptchaScenario();
                    cb();
                }
            ], cb)
        ], complete);
    }

    createLoginByEmail () {
        return new LoginByEmail({
            'email': this.get('email'),
            'password': this.get('password'),
            'rememberMe': this.get('rememberMe'),
            'user': this.user
        });
    }

    updateRateLimit (cb) {
        if (!this._rateLimitModel) {
            return cb();
        }
        if (this.hasError()) {
            return this._rateLimitModel.increment(cb);
        }
        this.isCaptchaRequired() // captcha has been validated
            ? this._rateLimitModel.reset(cb)
            : cb();        
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const RateLimit = require('areto/web/rate-limit/RateLimit');
const LoginByEmail = require('../component/auth/LoginByEmail');