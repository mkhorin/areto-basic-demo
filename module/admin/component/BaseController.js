'use strict';

const Base = require('../../../component/BaseController');

module.exports = class BaseController extends Base {

    getRefUrl () {
        let ref = this.isGet()
            ? this.getHttpHeader('referrer')
            : this.getBodyParam('referrer');
        return ref ? ref : '';
    }

    backToRef (url = 'index') {
        let ref = this.getBodyParam('referrer');
        this.redirect(ref || url);
    }
};