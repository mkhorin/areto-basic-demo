'use strict';

const Base = require('areto/view/Widget');

module.exports = class Breadcrumbs extends Base {

    run (cb) {
        if (this.links) {
            if (this.baseLinks) {
                this.links = this.baseLinks.concat(this.links);    
            }
        } else if (this.baseLinks) {
            this.links = this.baseLinks;
        }        
        this.render('_part/widget/breadcrumbs', cb, this.params);
    }
};