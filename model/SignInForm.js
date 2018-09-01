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

    async resolveCaptchaScenario () {
        if (this.rateLimit instanceof RateLimit) {
            this._rateLimitModel = await this.rateLimit.find(this.rateLimitType, this.user);
            this.toggleCaptchaScenario();
        }
    }

    async login () {
        if (await this.validate()) {
            let result = await this.createLoginByEmail().login();
            if (result.error) {
                this.addError('email', result.error);
            }
            await this.updateRateLimit();
            this.toggleCaptchaScenario();
        }
    }

    createLoginByEmail () {
        return new LoginByEmail({
            'email': this.get('email'),
            'password': this.get('password'),
            'rememberMe': this.get('rememberMe'),
            'user': this.user
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

const RateLimit = require('areto/web/rate-limit/RateLimit');
const LoginByEmail = require('../component/auth/LoginByEmail');