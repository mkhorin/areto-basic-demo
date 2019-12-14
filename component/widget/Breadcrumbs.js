'use strict';

const Base = require('areto/view/Widget');

module.exports = class Breadcrumbs extends Base {

    run () {
        if (this.links) {
            if (this.baseLinks) {
                this.links = this.baseLinks.concat(this.links);    
            }
        } else if (this.baseLinks) {
            this.links = this.baseLinks;
        }        
        return this.renderTemplate('_widget/breadcrumbs', this.params);
    }
};