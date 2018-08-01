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

    register (complete) {
        let model = null;
        async.series([
            cb => this.validate(cb),
            cb => this.hasError() ? complete() : cb(),
            cb => {
                model = new User;
                model.setAttrs(this);
                model.save(cb);
            },
            cb => {
                if (model.hasError()) {
                    this.addError('name', model.getFirstError());
                    return cb();
                }
                this.user.login(model, 0, cb);
            }
        ], complete);
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');