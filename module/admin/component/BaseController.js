'use strict';

const Base = require('../../../component/BaseController');

module.exports = class BaseController extends Base {

    getReferrer () {
        const url = this.isGetRequest()
            ? this.getHttpHeader('referrer')
            : this.getPostParam('referrer');
        return url ? url : '';
    }

    redirectToReferrer (url = 'index') {
        const {referrer} = this.getPostParams();
        this.redirect(referrer || url);
    }
};