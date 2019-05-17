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
                    fontFamily: 'Serif',
                    median: 0,
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
                    deny: (action, user)=> action.render('signed', {model: user.model})
                }
            }
        };
    }

    async actionLogout () {
        await this.user.logout();
        this.goHome();
    }

    async actionSignIn () {
        let model = this.spawn(SignInForm, {user: this.user});
        await model.resolveCaptchaScenario();
        if (this.isGet()) {
            return this.render('sign-in', {model});
        }
        model.captchaAction = this.createAction('captcha');
        await model.load(this.getPostParams()).login();
        return model.hasError()
            ? this.render('sign-in', {model})
            : this.goBack();
    }

    async actionSignUp () {
        let model = this.spawn(SignUpForm, {user: this.user});
        if (this.isGet()) {
            return this.render('sign-up', {model});
        }
        model.captchaAction = this.createAction('captcha');
        model.load(this.getPostParams());
        await model.register();
        return model.hasError()
            ? this.render('sign-up', {model})
            : this.goLogin();
    }
};
module.exports.init(module);

const SignInForm = require('../model/SignInForm');
const SignUpForm = require('../model/SignUpForm');