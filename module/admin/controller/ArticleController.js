'use strict';

const Base = require('../component/CrudController');

module.exports = class ArticleController extends Base {

    async actionIndex () {
        const searchText = this.getQueryParam('search');
        const provider = this.createDataProvider({
            query: this.spawn(Article).findBySearch(searchText).with('author', 'mainPhoto'),
            pagination: {pageSize: 10},
            sort: {
                attrs: {
                    [Article.PK]: true,
                    status: true,
                    title: true
                },
                defaultOrder: {[Article.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider, searchText});
    }

    async actionView () {
        const model = await this.getModel({
            with: ['author', 'category', 'photos', 'mainPhoto', 'tags']
        });
        const comments = this.createDataProvider({
            query: model.relComments(),
            sort: {
                attrs: {[model.PK]: true},
                defaultOrder: {[model.PK]: -1}
            }
        });
        await this.renderDataProvider(comments, 'view', {model, comments});
    }

    async actionCreate () {
        const model = this.spawn(Article);
        if (this.isGetRequest()) {
            await model.setDefaultValues();
            return this.renderForm('create', {model});
        }
        model.load(this.getPostParams());
        model.set('authorId', this.user.getId());
        await model.save()
            ? this.redirectToReferrer()
            : await this.renderForm('create', {model});
    }

    async actionUpdate () {
        const model = await this.getModel({with: ['photos', 'tags']});
        const access = await this.user.can('updateArticle', {
            controller: this,
            authorId: model.get('authorId')
        });
        if (!access) {
            throw new Forbidden;
        }
        if (this.isGetRequest()) {
            return this.renderForm('update', {model});
        }
        model.load(this.getPostParams());
        return await model.save()
            ? this.redirectToReferrer()
            : this.renderForm('update', {model});
    }

    async renderForm (template, params) {
        await this.render(template, {
            categories: await this.spawn(Category).findNames().all(),
            ...params
        });
    }
};
module.exports.init(module);

const Forbidden = require('areto/error/http/Forbidden');
const Category = require('../model/Category');
const Article = require('../model/Article');