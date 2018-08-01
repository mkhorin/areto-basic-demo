'use strict';

const Base = require('../component/CrudController');

module.exports = class ArticleController extends Base {

    actionIndex () {
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
        this.renderDataProvider(provider, 'index', {provider, searchText});
    }

    actionView () {
        this.getModel({
            with: ['author', 'category', 'photos', 'mainPhoto', 'tags']
        }, model => {
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
            this.renderDataProvider(comments, 'view', {model, comments});
        });
    }

    actionCreate () {
        let model = new Article;
        if (this.isGet()) {
            return this.renderForm('create', {model});
        }
        model.load(this.getBodyParams());
        model.set('authorId', this.user.getId());
        async.series([
            cb => model.save(cb),
            cb => model.hasError()
                ? this.renderForm('create', {model})
                : this.backToRef()
        ], err => this.throwError(err));
    }

    actionUpdate () {
        this.getModel({
            with: ['photos', 'tags']
        }, model => async.waterfall([
            cb => this.user.can('updateArticle', cb, {
                authorId: model.get('authorId')
            }),
            (access, cb)=> access
                ? cb()
                : this.throwForbidden(),
            cb => this.isGet()
                ? this.renderForm('update', {model})
                : model.load(this.getBodyParams()).save(cb),
            (model, cb)=> model.hasError()
                ? this.renderForm('update', {model})
                : this.backToRef()
        ], err => this.throwError(err)));
    }

    renderForm (template, params) {
        async.waterfall([
            cb => async.series({
                categories: cb => Category.findNames().all(cb),
            }, cb),
            data => this.render(template, Object.assign(data, params))
        ], err => this.throwError(err));
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const Category = require('../model/Category');
const Article = require('../model/Article');