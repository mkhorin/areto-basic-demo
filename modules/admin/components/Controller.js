'use strict';

const Base = require('../../../components/Controller');

module.exports = class Controller extends Base {

    getRefUrl () {
        let ref = this.isGet()
            ? this.getHeader('referrer')
            : this.getBodyParam('referrer');
        return ref ? ref : '';
    }

    backToRef (url = 'index') {
        let ref = this.getBodyParam('referrer');
        this.redirect(ref || url);
    }
};