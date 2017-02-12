'use strict';

const Base = require('areto/base/Model');
const User = require('./User');

module.exports = class SignUpForm extends Base {

    static getConstants () {
        return {
            RULES: [
                [['name', 'email', 'password', 'passwordRepeat', 'captchaCode'], 'required'],
                ['name', 'string', {min: 3, max: 24}],
                ['name', 'regexp', {
                    pattern: /^[а-яa-z\s-]+$/i
                }],
                ['email', 'email'],
                ['captchaCode', require('areto/captcha/CaptchaValidator'), {
                    CaptchaController: require('../controllers/AuthController')
                }],
                ['password', 'string', {min: 6, max: 24}],
                ['passwordRepeat', 'compare', {compareAttr: 'password'}],
                [['name', 'email'], 'unique', {
                    skipOnAnyError: true, 
                    targetClass: User, 
                    ignoreCase: true
                }]
            ],
            LABELS: {               
                captchaCode: 'Verification code'
            }
        };
    }

    signUp (webuser, cb) {
        this.validate(err => {
            if (err || this.hasError()) {
                cb(err);
            } else {
                let model = new User;
                model.assignAttrs(this);
                model.save(err => {
                    if (model.hasError()) {
                        this.addError('name', model.getFirstError());
                        cb(err);
                    } else {
                        webuser.login(model, 0, cb);
                    }
                });
            }
        })
    }
};
module.exports.init(module);