'use strict';

const Base = require('../component/CrudController');

module.exports = class TagController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                'access': {
                    Class: require('areto/filter/AccessControl'),
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

    actionIndex () {
        let provider = this.createDataProvider({            
            query: Tag.findBySearch(this.getQueryParam('search')),
            sort: {
                attrs: {
                    [Tag.PK]: true,
                    name: true
                },
                defaultOrder: {
                    [Tag.PK]: -1
                }
            }
        });
        this.renderDataProvider(provider, 'index', {provider});
    }

    actionView () {
        this.getModel(null, model => {
            let articles = this.createDataProvider({                
                query: model.relArticles(),
                sort: {
                    attrs: {
                        [model.PK]: true
                    },
                    defaultOrder: {
                        [model.PK]: -1
                    }
                }
            });
            this.renderDataProvider(articles, 'view', {model, articles});
        });
    }
};
module.exports.init(module);

const Tag = require('../model/Tag');