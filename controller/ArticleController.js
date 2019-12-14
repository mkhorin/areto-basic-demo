'use strict';

const Base = require('../component/BaseController');

module.exports = class ArticleController extends Base {

    async actionIndex () {
        const provider = this.createDataProvider({
            query: this.spawn(Article).findPublished()
        });
        await provider.prepare();
        await this.render('index', {provider});
    }

    async actionCategory () {
        const category = await this.getModel({
            ModelClass: Category,
            id: this.getQueryParam('category')
        });
        const provider = this.createDataProvider({
            query: this.spawn(Article).findPublishedByCategory(category.getId())
        });
        await this.renderDataProvider(provider, 'category', {provider, category});
    }

    async actionTagged () {
        const tagName = this.getQueryParam('tag');
        const tag = this.spawn(Tag);
        tag.set('name', tagName);
        if (!await tag.validate()) {
            return this.render('tagged', {tagName});
        }
        const model = await tag.findByName(tagName).one();
        if (!model) {
            return this.render('tagged', {tagName});
        }
        const provider = this.createDataProvider({query: model.relArticles()});
        await this.renderDataProvider(provider, 'tagged', {provider, tagName});
    }

    async actionSearch () {
        const search = String(this.getQueryParam('text')).trim();
        const provider = this.createDataProvider({
            query: this.spawn(Article).findBySearch(search)
        });
        await this.renderDataProvider(provider, 'index', {provider, search});
    }

    async actionView () {
        const model = await this.getModel({with: ['category', 'mainPhoto', 'photos', 'tags']});
        const comment = this.spawn(Comment, {scenario: 'create'});
        if (this.isGet()) {
            return this.renderView(model, comment);
        }
        comment.load(this.getPostParams());
        comment.set('articleId', model.getId());
        comment.set('ip', this.user.getIp());
        if (!await comment.save()) {
            return this.renderView(model, comment);
        }
        this.setFlash('comment-done', 'You message has been sent successfully!');
        this.redirect(['view', model]);
    }

    createDataProvider (params) {
        return super.createDataProvider({
            pagination: {pageSize: 10},
            sort: {
                attrs: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: -1}
            },
            ...params
        });
    }

    async renderView (model, comment) {
        const comments = this.createDataProvider({query: model.relComments()});
        await comments.prepare();
        await this.render('view', {model, comments, comment});
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Category = require('../model/Category');
const Comment = require('../model/Comment');
const Tag = require('../model/Tag');