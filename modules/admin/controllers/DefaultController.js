'use strict';

let Base = require('../components/Controller');

module.exports = class DefaultController extends Base {


    actionIndex () {        
        this.render('index', {
            title: 'Dashboard',
            breadcrumbs: [
                {label: 'Dashboard'}
            ]
        });
    }
};
module.exports.init(module);