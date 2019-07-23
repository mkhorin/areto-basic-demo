'use strict';

const Base = require('areto/base/Model');
const User = require('./User');

module.exports = class SignUpForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['name', 'email', 'password', 'passwordRepeat', 'captchaCode'], 'required'],
                ['name', 'string', {min: 3, max: 24}],
                ['name', 'regexp', {pattern: /^[а-яa-z\s-]+$/i}],
                ['email', 'email'],
                ['password', 'string', {min: 6, max: 24}],
                ['passwordRepeat', 'compare', {compareAttr: 'password'}],
                ['captchaCode', require('areto/captcha/CaptchaValidator')],
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
        if (await this.validate()) {
            const model = this.spawn(User);
            model.setAttrs(this);
            if (await model.save()) {
                await this.user.login(model, 0);
            } else {
                this.addError('name', model.getFirstError());
            }
        }
    }
};
module.exports.init(module);