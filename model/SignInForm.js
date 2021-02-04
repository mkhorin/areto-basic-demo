'use strict';

const CAPTCHA_SCENARIO = 'captcha';
const Base = require('areto/base/Model');

module.exports = class SignInForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['email', 'password'], 'required'],
                ['email', 'email'],
                ['password', 'string', {min: 6, max: 24}],
                ['rememberMe', 'checkbox'],
                ['captchaCode', 'required', {on: [CAPTCHA_SCENARIO]}],
                ['captchaCode', {
                    Class: require('areto/security/captcha/CaptchaValidator'),
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
        super({
            // user: [WebUser]
            rateLimit: config.module.get('rateLimit'),
            rateLimitType: 'signIn',
            rememberPeriod: 7 * 24 * 3600,
            ...config
        });
    }

    isCaptchaRequired () {
        return this.scenario === this.CAPTCHA_SCENARIO;
    }

    setCaptchaScenario () {
        this.scenario = this._rateLimitModel?.isExceeded() ? this.CAPTCHA_SCENARIO : null;
    }

    async resolveCaptchaScenario () {
        if (this.rateLimit instanceof RateLimit) {
            this._rateLimitModel = await this.rateLimit.find(this.rateLimitType, this.user);
            this.setCaptchaScenario();
        }
    }

    async login () {
        if (await this.validate()) {
            const error = await this.createAuthService().login();
            if (error) {
                this.addError('email', error);
            }
            await this.updateRateLimit();
            this.setCaptchaScenario();
        }
    }

    createAuthService () {
        return new PasswordAuthService({
            module: this.module,
            email: this.get('email'),
            password: this.get('password'),
            rememberMe: this.get('rememberMe'),
            user: this.user
        });
    }

    async updateRateLimit () {
        if (this._rateLimitModel) {
            if (this.hasError()) {
                await this._rateLimitModel.increment();
            }
            if (this.isCaptchaRequired()) { // captcha has been validated
                await this._rateLimitModel.reset();
            }
        }
    }
};
module.exports.init(module);

const RateLimit = require('areto/security/rateLimit/RateLimit');
const PasswordAuthService = require('../component/security/PasswordAuthService');