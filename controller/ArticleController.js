'use strict';

const Base = require('../component/BaseController');

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
        this.getModel({
            ModelClass: Category,
            id: this.getQueryParam('category')
        }, category => {
            let provider = this.createDataProvider({
                query: Article.findPublishedByCategory(category.getId())
            });
            this.renderDataProvider(provider, 'category', {provider, category});
        });
    }

    actionTagged () {
        let tagName = this.getQueryParam('tag');
        async.waterfall([
          cb => this.getTag(tagName, cb),
          tag => {
              let provider = this.createDataProvider({
                  query: tag.relArticles()
              });
              this.renderDataProvider(provider, 'tagged', {provider, tagName});
          }
        ], err => this.throwError(err));
    }

    actionSearch () {
        let provider = this.createDataProvider({
            query: Article.findBySearch(this.getQueryParam('text'))
        });
        this.renderDataProvider(provider, 'index', {provider});
    }

    actionView () {
        this.getModel({
            with: ['category', 'mainPhoto', 'photos', 'tags']
        }, model => {
            let comment = new Comment;
            if (this.isGet()) {
                return this.renderView(model, comment);
            }
            comment.load(this.getBodyParams());
            comment.set('articleId', model.getId());
            comment.set('ip', this.req.ip);
            async.series([
                cb => comment.save(cb),
                cb => comment.hasError()
                    ? this.renderView(model, comment)
                    : cb(),
                cb => {
                    this.setFlash('comment-done', this.translate('You message has been sent successfully!'));
                    this.redirect(['view', model]);
                }
            ], err => this.throwError(err));
        });
    }

    createDataProvider (params) {
        return super.createDataProvider(Object.assign({
            pagination: {
                pageSize: 10
            },
            sort: {
                attrs: {
                    date: true,
                    title: true
                },
                defaultOrder: {
                    date: -1
                }
            }
        }, params));
    }

    renderView (model, comment) {
        let comments = this.createDataProvider({
            query: model.relComments()
        });
        async.series([
            cb => comments.prepare(cb),
            cb => this.render('view', {model, comments, comment})
        ], err => this.throwError(err));
    }

    getTag (tagName, cb) {
        let tag = new Tag;
        tag.set('name', tagName);
        async.waterfall([
            cb => tag.validate(cb),
            (tag, cb)=> tag.hasError()
                ? this.render('tagged', {tagName})
                : cb(),
            cb => Tag.findByName(tagName).one(cb),
            model => model
                ? cb(null, model)
                : this.render('tagged', {tagName})
        ], err => this.throwError(err));
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const Article = require('../model/Article');
const Category = require('../model/Category');
const Comment = require('../model/Comment');
const Tag = require('../model/Tag');