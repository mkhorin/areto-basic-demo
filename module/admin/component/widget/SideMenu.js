'use strict';

const Base = require('areto/view/Widget');

module.exports = class SideMenu extends Base {

    run (cb) {
        if (!(this.items instanceof Array)) {
            return cb();
        }
        for (let item of this.items) {
            this.prepareItem(item);
        }
        this.render('_part/widget/side-menu', cb, this.params);
    }

    prepareItem (item) {
        if (this.controller.getOriginalUrl().indexOf(item.url) === 0) {
            item.active = true;
        }
    }
};