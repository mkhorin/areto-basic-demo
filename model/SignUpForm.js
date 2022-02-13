'use strict';

const Base = require('areto/base/Model');
const User = require('./User');

module.exports = class SignUpForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['name', 'email', 'password', 'passwordRepeat', 'captchaCode'], 'required'],
                ['name', 'string', {min: 3, max: 24}],
                ['name', 'regex', {pattern: /^[а-яa-z\s-]+$/i}],
                ['email', 'email'],
                ['password', 'string', {min: 6, max: 24}],
                ['passwordRepeat', 'compare', {compareAttr: 'password'}],
                ['captchaCode', require('areto/security/captcha/CaptchaValidator')],
                [['name', 'email'], 'unique', {
                    skipOnAnyError: true,
                    targetClass: User,
                    ignoreCase: true
                }]
            ],
            ATTR_LABELS: {
                captchaCode: 'Verification code'
            }
        };
    }

    async register () {
        if (!await this.validate()) {
            return false;
        }
        const model = this.spawn(User);
        model.setAttrs(this);
        if (!await model.save()) {
            return this.addError('name', model.getFirstError());
        }
        return this.user.login({
            identity: model,
            duration: 0
        });
    }
};
module.exports.init(module);