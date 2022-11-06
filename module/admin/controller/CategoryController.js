'use strict';

const Base = require('../component/CrudController');

module.exports = class CategoryController extends Base {

    async actionIndex () {
        const {search: searchText} = this.getQueryParams();
        const provider = this.createDataProvider({
            query: this.spawn(Category).findBySearch(searchText),
            sort: {
                attrs: {
                    [Category.PK]: true,
                    name: true
                },
                defaultOrder: {[Category.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider, searchText});
    }

    async actionView () {
        const model = await this.getModel();
        const articles = this.createDataProvider({
            query: model.relArticles(),
            sort: {
                attrs: {[model.PK]: true},
                defaultOrder: {[model.PK]: -1}
            }
        });
        await this.renderDataProvider(articles, 'view', {model, articles});
    }
};
module.exports.init(module);

const Category = require('../model/Category');