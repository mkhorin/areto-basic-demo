'use strict';

const Base = require('../components/Controller');

module.exports = class AuthController extends Base {

    static getConstants () {
        return {
            ACTIONS: {
                'captcha': {
                    Class: require('areto/captcha/CaptchaAction'),
                    minLength: 3,
                    maxLength: 4,
                    // fixedVerifyCode: '123'
                }
            }
        };
    }

    actionSignin () {
        if (!this.user.isAnonymous()) {
            return this.render('signed', {
                model: this.user.identity
            });
        }
        this.module.components.rateLimit.find('signin', this.user, (err, rateLimitModel)=> {
            if (err) {
                return this.throwError(err);
            }
            let Form = require('../models/SignInForm');
            let model = new Form({
                controller: this,
                rateLimitModel
            });
            let params = {
                model,
                user: this.user
            };
            if (this.isGet()) {
                return this.render('signin', params);
            }
            model.load(this.getBodyParams());
            model.login(this.user, err => {
                if (err) {
                    this.throwError(err);
                } else if (model.hasError()) {
                    this.render('signin', params);
                } else {
                    this.goBack();
                }
            });
        });
    }

    actionLogout () {
        this.user.logout(err => {
            err ? this.throwError(err) : this.goLogin();
        });
    }

    actionSignup () {
        if (!this.user.isAnonymous()) {
            return this.render('signed', {
                model: this.user.identity
            });
        }
        let Form = require('../models/SignUpForm');
        let model = new Form({
            controller: this
        });
        let params = {
            model,
            user: this.user
        };
        if (this.isGet()) {
            return this.render('signup', params);
        }
        model.load(this.getBodyParams());
        model.signUp(this.user, err => {
            if (err) {
                this.throwError(err)
            } else if (model.hasError()) {
                this.render('signup', params);
            } else {
                this.goLogin();
            }
        });
    }
};
module.exports.init(module);