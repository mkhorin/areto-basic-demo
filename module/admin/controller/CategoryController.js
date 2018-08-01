'use strict';

const Base = require('../component/CrudController');

module.exports = class CategoryController extends Base {

    actionIndex () {
        let searchText = this.getQueryParam('search');
        let provider = this.createDataProvider({            
            query: Category.findBySearch(searchText),
            sort: {
                attrs: {
                    [Category.PK]: true,
                    name: true
                },
                defaultOrder: {
                    [Category.PK]: -1
                }
            }
        });
        this.renderDataProvider(provider, 'index', {provider, searchText});
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

const Category = require('../model/Category');