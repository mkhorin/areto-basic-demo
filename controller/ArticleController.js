'use strict';

const Base = require('../component/BaseController');

module.exports = class ArticleController extends Base {

    async actionIndex () {
        let provider = this.createDataProvider({
            query: Article.findPublished()
        });
        await provider.prepare();
        await this.render('index', {provider});
    }

    async actionCategory () {
        let category = await this.getModel({
            ModelClass: Category,
            id: this.getQueryParam('category')
        });
        let provider = this.createDataProvider({
            query: Article.findPublishedByCategory(category.getId())
        });
        await this.renderDataProvider(provider, 'category', {provider, category});
    }

    async actionTagged () {
        let tagName = this.getQueryParam('tag');
        let tag = new Tag;
        tag.set('name', tagName);
        if (!await tag.validate()) {
            return this.render('tagged', {tagName});
        }
        let model = await Tag.findByName(tagName).one();
        if (!model) {
            return this.render('tagged', {tagName});
        }
        let provider = this.createDataProvider({
            query: model.relArticles()
        });
        await this.renderDataProvider(provider, 'tagged', {provider, tagName});
    }

    async actionSearch () {
        let search = String(this.getQueryParam('text')).trim();
        let provider = this.createDataProvider({
            query: Article.findBySearch(search)
        });
        await this.renderDataProvider(provider, 'index', {provider, search});
    }

    async actionView () {
        let model = await this.getModel({
            with: ['category', 'mainPhoto', 'photos', 'tags']
        });
        let comment = new Comment;
        if (this.isGet()) {
            return this.renderView(model, comment);
        }
        comment.load(this.getBodyParams());
        comment.set('articleId', model.getId());
        comment.set('ip', this.req.ip);
        if (!await comment.save()) {
            return this.renderView(model, comment);
        }
        this.setFlash('comment-done', this.translate('You message has been sent successfully!'));
        this.redirect(['view', model]);
    }

    createDataProvider (params) {
        return super.createDataProvider({
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
            },
            ...params
        });
    }

    async renderView (model, comment) {
        let comments = this.createDataProvider({
            query: model.relComments()
        });
        await comments.prepare();
        await this.render('view', {model, comments, comment});
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Category = require('../model/Category');
const Comment = require('../model/Comment');
const Tag = require('../model/Tag');