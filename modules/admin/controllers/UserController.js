'use strict';

let Base = require('../components/CrudController');

module.exports = class UserController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                access: {
                    Class: require('areto/filters/AccessControl'),
                    rules: [{
                        allow: true,
                        roles: ['admin']
                    }]
                }
            }
        };
    }

    getModelClass () {
        return require('../models/User');
    }

    actionIndex () {
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.findBySearch(this.getQueryParam('search')),
            sort: {
                attrs: {
                    [Class.PK]: true,
                    name: true,
                    email: true,
                    role: true
                },
                defaultOrder: {
                    [Class.PK]: 'DESC'
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {provider});
        });
    }

};
module.exports.init(module);

let ActiveDataProvider = require('areto/data/ActiveDataProvider');