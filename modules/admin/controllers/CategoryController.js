'use strict';

const Base = require('../components/CrudController');

module.exports = class CategoryController extends Base {

    actionIndex () {
        let searchText = this.getQueryParam('search');
        let ModelClass = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: ModelClass.findBySearch(searchText),
            sort: {
                attrs: {
                    [ModelClass.PK]: true,
                    name: true
                },
                defaultOrder: {
                    [ModelClass.PK]: -1
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {
               provider, searchText
           });
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
                        [model.PK]: -1
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