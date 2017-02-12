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
        if (this.user.isGuest()) {
            RateLimit.findByIp('auth', this.req.ip, (err, rateLimit)=> {
                let Form = require('../models/SignInForm');
                let model = new Form({controller: this, rateLimit});
                let params = {model, user: this.user};
                if (this.isPost()) {
                    model.load(this.getBodyParams());
                    model.login(this.user, err => {
                        err ? this.throwError(err)
                            : model.hasError() ? this.render('signin', params) : this.goBack();
                    });
                } else {
                    this.render('signin', params);
                }
            });
        } else {
            this.render('signed', {model: this.user.identity});
        }
    }

    actionLogout () {
        this.user.logout(err => {
            err ? this.render('signed', {model: this.user.identity}) 
                : this.redirect('/auth/signin');
        });
    }

    actionSignup () {
        if (this.user.isGuest()) {
            let Form = require('../models/SignUpForm');
            let model = new Form({controller: this});
            let params = {model, user: this.user};
            if (this.isPost()) {
                model.load(this.getBodyParams());
                model.signUp(this.user, err => {
                    err ? this.throwError(err)
                        : model.hasError() ? this.render('signup', params) : this.goLogin();
                });
            } else {
                this.render('signup', params);
            }
        } else {
            this.render('signed', {model: this.user.identity});
        }
    }
};
module.exports.init(module);

let RateLimit = require('../models/RateLimit');