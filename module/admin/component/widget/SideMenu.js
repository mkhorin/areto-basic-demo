'use strict';

const Base = require('areto/view/Widget');

module.exports = class SideMenu extends Base {

    execute () {
        if (!Array.isArray(this.items)) {
            return '';
        }
        for (const item of this.items) {
            this.prepareItem(item);
        }
        return this.renderTemplate('_widget/sideMenu', this.params);
    }

    prepareItem (item) {
        if (this.controller.getOriginalUrl().indexOf(item.url) === 1) {
            item.active = true;
        }
    }
};