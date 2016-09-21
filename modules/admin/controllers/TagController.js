'use strict';

let Base = require('../components/CrudController');

module.exports = class TagController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                access: {
                    Class: require('areto/filters/AccessControl'),
                    rules: [{
                        //actions: ['update'],
                        //roles: ['updateTag']
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
            query: Class.findBySearch(this.getQueryParam('search')).with('author', 'mainPhoto'),
            sort: {
                attributes: {
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
                    attributes: {
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

let ActiveDataProvider = require('areto/data/ActiveDataProvider');