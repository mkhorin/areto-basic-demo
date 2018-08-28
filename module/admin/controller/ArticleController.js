'use strict';

const Base = require('../component/CrudController');

module.exports = class ArticleController extends Base {

    async actionIndex () {
        let searchText = this.getQueryParam('search');
        let query = Article.findBySearch(this.getQueryParam('search')).with('author', 'mainPhoto');
        let provider = this.createDataProvider({
            query,
            pagination: {
                pageSize: 10
            },
            sort: {
                attrs: {
                    [Article.PK]: true,
                    status: true,
                    title: true
                },
                defaultOrder: {
                    [Article.PK]: -1
                }
            }
        });
        await this.renderDataProvider(provider, 'index', {provider, searchText});
    }

    async actionView () {
        let model = await this.getModel({
            with: ['author', 'category', 'photos', 'mainPhoto', 'tags']
        });
        let comments = this.createDataProvider({
            query: model.relComments(),
            sort: {
                attrs: {
                    [model.PK]: true
                },
                defaultOrder: {
                    [model.PK]: -1
                }
            }
        });
        await this.renderDataProvider(comments, 'view', {model, comments});
    }

    async actionCreate () {
        let model = new Article;
        if (this.isGet()) {
            return this.renderForm('create', {model});
        }
        model.load(this.getBodyParams());
        model.set('authorId', this.user.getId());
        await model.save()
            ? this.backToRef()
            : await this.renderForm('create', {model});
    }

    async actionUpdate () {
        let model = await this.getModel({
            with: ['photos', 'tags']
        });
        let access = await this.user.can('updateArticle', {
            authorId: model.get('authorId')
        });
        if (!access) {
            throw new ForbiddenHttpException;
        }
        this.isPost() && await model.load(this.getBodyParams()).save()
            ? this.backToRef()
            : await this.renderForm('update', {model});
    }

    async renderForm (template, params) {        
        await this.render(template, Object.assign({
            categories: await Category.findNames().all()
        }, params));
    }
};
module.exports.init(module);

const ForbiddenHttpException = require('areto/error/ForbiddenHttpException');
const Category = require('../model/Category');
const Article = require('../model/Article');