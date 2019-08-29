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
                        permissions: ['editor']
                    },{
                        permissions: ['reader']
                    }]
                }
            }
        };
    }

    async actionIndex () {
        const provider = this.createDataProvider({
            query: this.spawn(Tag).findBySearch(this.getQueryParam('search')),
            sort: {
                attrs: {
                    [Tag.PK]: true,
                    name: true
                },
                defaultOrder: {[Tag.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider});
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

const Tag = require('../model/Tag');