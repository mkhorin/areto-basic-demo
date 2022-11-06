'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    async actionIndex () {
        const duration = this.module.getParam('dashboard.cacheDuration', 60);
        const cache = this.module.get('cache');
        const dashboard = await cache.use('dashboard', this.renderDashboard.bind(this), duration);
        await this.render('index', {dashboard});
    }

    async renderDashboard () {
        const data = await this.getDashboard();
        return this.renderOnly('dashboard', data);
    }

    async getDashboard () {

        this.user.setCookie('test', {test: 'test'});

        const article = this.spawn(Article);
        const photo = this.spawn(Photo);
        const tag = this.spawn(Tag);
        const comment = this.spawn(Comment);
        return {
            drafts: await article.findByStatus(Article.STATUS_DRAFT).count(),
            published: await article.findByStatus(Article.STATUS_PUBLISHED).count(),
            archived: await article.findByStatus(Article.STATUS_ARCHIVED).count(),
            blocked: await article.findByStatus(Article.STATUS_BLOCKED).count(),
            photos: await photo.createQuery().count(),
            tags: await tag.createQuery().count(),
            pending: await comment.findByStatus(Comment.STATUS_PENDING).count(),
            approved: await comment.findByStatus(Comment.STATUS_APPROVED).count(),
            rejected: await comment.findByStatus(Comment.STATUS_REJECTED).count()
        };
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Comment = require('../model/Comment');
const Photo = require('../model/Photo');
const Tag = require('../model/Tag');