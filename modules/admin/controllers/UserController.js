'use strict';

const Base = require('../components/CrudController');

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
                    [Class.PK]: -1
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {provider});
        });
    }

};
module.exports.init(module);

const ActiveDataProvider = require('areto/data/ActiveDataProvider');