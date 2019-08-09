'use strict';

const Base = require('../../../component/BaseController');

module.exports = class BaseController extends Base {

    getRefUrl () {
        const ref = this.isGet()
            ? this.getHttpHeader('referrer')
            : this.getPostParam('referrer');
        return ref ? ref : '';
    }

    backToRef (url = 'index') {
        this.redirect(this.getPostParam('referrer') || url);
    }
};