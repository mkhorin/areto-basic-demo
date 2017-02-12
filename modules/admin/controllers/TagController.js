'use strict';

const Base = require('../components/CrudController');

module.exports = class TagController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                access: {
                    Class: require('areto/filters/AccessControl'),
                    rules: [{
                        actions: ['create'],
                        roles: ['editor']
                    },{
                        roles: ['reader']
                    }]
                }
            }
        };
    }
    
    getModelClass () {
        return require('../models/Tag');
    }

    actionIndex () {
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.findBySearch(this.getQueryParam('search')),
            sort: {
                attrs: {
                    [Class.PK]: true,
                    name: true
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

    actionView () {
        this.getModel(model => {
            let articles = new ActiveDataProvider({
                controller: this,
                query: model.relArticles(),
                sort: {
                    attrs: {
                        [model.PK]: true
                    },
                    defaultOrder: {
                        [model.PK]: 'DESC'
                    }
                }
            });
            articles.prepare(err => {
                err ? this.throwError(err)
                    : this.render('view', {model, articles});
            });
        });
    }
};
module.exports.init(module);

const ActiveDataProvider = require('areto/data/ActiveDataProvider');