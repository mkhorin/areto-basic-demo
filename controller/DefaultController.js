'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    async actionIndex () {
        await this.render('index');
    }

    async actionError () {
        if (this.err.isServerError() || this.module.get('logger').isDebug()) {
            this.log('error', this.err);
        }
        this.setHttpStatus(this.err.status);
        if (this.isAjax()) {
            return this.sendText(this.err, this.err.status);
        }
        if (this.err.status === 403 && this.user.isGuest()) {
            return this.user.loginRequired(this);
        }
        switch (this.err.status) {
            case 400:
            case 403:
            case 404:
                await this.render(this.err.status);
                break;
            default:
                await this.render(500);
        }
    }
};
module.exports.init(module);