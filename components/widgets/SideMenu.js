'use strict';

let Base = require('areto/base/Widget');

module.exports = class SideMenu extends Base {

    run (cb) {
        if (this.items instanceof Array) {
            for (let item of this.items) {
                this.prepareItem(item);
            }
            this.render('_parts/widgets/side-menu', cb, this.params);
        } else cb();
    }

    prepareItem (item) {
        if (this.view.controller.req.originalUrl.indexOf(item.url) === 0) {
            item.active = true;
        }
    }
};