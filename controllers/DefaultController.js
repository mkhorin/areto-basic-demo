'use strict';

const Base = require('../components/Controller');

module.exports = class DefaultController extends Base {

    actionIndex () {
        this.send('Hello blog');
    }

    actionError () {
        this.setStatus(this.err.status);
        if (this.isAjax()) {
            this.sendText(this.err, this.err.status);
        } else {           
            switch (this.err.status) {
                case 400:
                case 403:
                case 404:
                    this.render(this.err.status);
                    break;
                default:
                    this.render(500);
            }
        }
        if (this.err.isServerError() || this.module.components.logger.isDebug()) {
            this.module.log('error', this.err);
        }
    }
};
module.exports.init(module);