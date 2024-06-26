'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    async actionIndex () {
        await this.render('index');
    }

    async actionError () {
        this.log('error', this.err);
        const {status} = this.err;
        this.setHttpStatus(status);
        if (this.isAjax()) {
            return this.sendText(this.err, status);
        }
        if (status === 403 && this.isAuthRedirect()) {
            return true;
        }
        switch (status) {
            case 400:
            case 403:
            case 404:
                return this.render(status);
        }
        return this.render(500);
    }

    isAuthRedirect () {
        if (this.user.isGuest()) {
            this.user.setReturnUrl(this.getOriginalUrl());
            const url = this.user.getLoginUrl();
            if (url) {
                this.redirect(url);
                return true;
            }
        }
    }
};
module.exports.init(module);