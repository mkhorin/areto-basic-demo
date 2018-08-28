'use strict';

const Base = require('areto/view/Widget');

module.exports = class SideMenu extends Base {

    run () {
        if (this.items instanceof Array) {
            for (let item of this.items) {
                this.prepareItem(item);
            }
            return this.render('_part/widget/side-menu', this.params);
        }
    }

    prepareItem (item) {
        if (this.controller.getOriginalUrl().indexOf(item.url) === 0) {
            item.active = true;
        }
    }
};