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

    actionLogout () {
        this.user.logout(err => {
            err ? this.throwError(err) : this.goHome();
        });
    }

    actionSignin () {
        if (this.rejectSignedUser()) {
            return;
        }
        async.waterfall([
            cb => this.module.components.rateLimit.find('signin', this.user, cb),
            (rateLimitModel, cb)=> {
                let model = new SignInForm({
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
                model.login(this.user, err => cb(err, params));
            },
            (params, cb)=> {
                params.model.hasError() ? this.render('signin', params) : this.goBack();
            }
        ], err => this.throwError(err));
    }

    actionSignup () {
        if (this.rejectSignedUser()) {
            return;
        }
        let model = new SignUpForm({
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

    rejectSignedUser () {
        if (!this.user.isAnonymous()) {
            this.render('signed', {
                model: this.user.model
            });
            return true;
        }
    }
};
module.exports.init(module);

const async = require('areto/helpers/AsyncHelper');
const SignInForm = require('../models/SignInForm');
const SignUpForm = require('../models/SignUpForm');