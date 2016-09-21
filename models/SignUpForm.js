'use strict';

let Base = require('areto/base/Model');
let User = require('./User');

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
                ['passwordRepeat', 'compare', {compareAttribute: 'password'}],
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

    init () {
        super.init();        
        this._user = false;
    }

    signUp (webuser, cb) {
        this.validate(err => {
            if (err || this.hasError()) {
                cb(err);
            } else {
                let model = new User;
                model.assignAttributes(this);
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