'use strict';

const Base = require('../component/BaseController');

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
            },
            BEHAVIORS: {
                'rejectSigned': {
                    Class: require('areto/filter/AccessControl'),
                    rules: [{
                        actions: ['sign-in', 'sign-up'],
                        roles: ['?']
                    }],
                    denyCallback: (action, user, cb)=> {
                        action.render('signed', {
                            model: user.model
                        }, cb);
                    }
                }
            }
        };
    }

    actionLogout () {
        this.user.logout(err => err ? this.throwError(err) : this.goHome());
    }

    actionSignIn () {
        let model = new SignInForm({
            user: this.user
        });
        async.series([
            cb => model.resolveCaptchaScenario(cb),
            cb => {
                if (this.isGet()) {
                    return this.render('sign-in', {model});
                }
                model.captchaAction = this.createAction('captcha');
                model.load(this.getBodyParams()).login(cb);
            },
            cb => model.hasError()
                ? this.render('sign-in', {model})
                : this.goBack()
        ], err => this.throwError(err));
    }

    actionSignUp () {
        let model = new SignUpForm({
            user: this.user
        });
        if (this.isGet()) {
            return this.render('sign-up', {model});
        }
        model.captchaAction = this.createAction('captcha');
        model.load(this.getBodyParams());
        async.series([
            cb => model.register(cb),
            cb => model.hasError()
                ? this.render('sign-up', {model})
                : this.goLogin()
        ], err => this.throwError(err));
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const SignInForm = require('../model/SignInForm');
const SignUpForm = require('../model/SignUpForm');