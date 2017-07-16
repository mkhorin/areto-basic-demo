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
                return cb(err);
            }
            let model = new User;
            model.setAttrs(this);
            model.save(err => {
                if (model.hasError()) {
                    this.addError('name', model.getFirstError());
                    return cb(err);
                }
                webuser.login(model, 0, cb);
            });
        })
    }
};
module.exports.init(module);