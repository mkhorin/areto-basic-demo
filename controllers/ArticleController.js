'use strict';

const Base = require('../components/Controller');

module.exports = class ArticleController extends Base {

    actionIndex () {
        let provider = this.createDataProvider({
            query: Article.findPublished()
        });
        provider.prepare(err => {
            err ? this.throwError(err)
                : this.render('index', {provider});
        });
    }

    actionCategory () {
        let category = null;
        let provider = null;
        async.waterfall([
            cb => Category.findById(this.getQueryParam('category')).one(cb),
            (model, cb)=> {
                category = model;
                category ? cb() : this.throwNotFound();
            },
            cb => {
                provider = this.createDataProvider({
                    query: Article.findPublished().and({
                        category: category.getId()
                    })
                });
                provider.prepare(cb);
            }
        ], err => {
            err ? this.throwError(err)
                : this.render('category', {provider, category});
        });
    }

    actionTagged () {
        let tagName = this.getQueryParam('tag');
        let provider = null;
        let tag = new Tag;
        tag.set('name', tagName);
        async.series([
            cb => tag.validate(cb),
            cb => tag.hasError() ? this.render('tagged', {tagName}) : cb(),
            cb => async.waterfall([
                cb => Tag.find({name: tagName}).one(cb),
                (model, cb)=> model ? cb(null, model) : this.render('tagged', {tagName}),
                (model, cb)=> {
                    provider = this.createDataProvider({
                        query: model.relArticles()
                    });
                    provider.prepare(cb);
                }
            ], cb)
        ], err => {
            err ? this.throwError(err)
                : this.render('tagged', {provider, tagName});
        });
    }

    actionSearch () {
        let provider = this.createDataProvider({
            query: this.getModelClass().findBySearch(this.getQueryParam('text'))
        });
        provider.prepare(err => {
            err ? this.throwError(err)
                : this.render('index', {provider});
        });
    }

    actionView () {
        this.getModel(model => {
            let comment = new Comment;
            if (this.isGet()) {
                return this.renderView(model, comment);
            }
            comment.load(this.getBodyParams());
            comment.set('articleId', model.getId());
            comment.set('ip', this.req.ip);
            comment.save(err => {
                if (err) {
                    return this.throwError(err);
                }
                if (comment.hasError()) {
                    return this.renderView(model, comment);
                }
                this.setFlash('comment-done', 'You message has been sent successfully!');
                this.redirect(['view', model]);
            });
        }, 'category', 'mainPhoto', 'photos', 'tags');
    }

    createDataProvider (params) {
        return new ActiveDataProvider(Object.assign({
            controller: this,
            pagination: {
                pageSize: 10
            },
            sort: {
                attrs: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: -1}
            }
        }, params));
    }

    renderView (model, comment) {
        let comments = new ActiveDataProvider({
            controller: this,
            query: model.relComments()
        });
        comments.prepare(err => {
            err ? this.throwError(err)
                : this.render('view', {model, comments, comment});
        });
    }
};
module.exports.init(module);

const async = require('areto/helpers/AsyncHelper');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');