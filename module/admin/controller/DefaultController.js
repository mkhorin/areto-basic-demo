'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    async actionIndex () {
        let duration = this.module.getParam('dashboard.cacheDuration', 60);
        let dashboard = await this.module.get('cache').use('dashboard', this.renderDashboard.bind(this), duration);
        await this.render('index', {dashboard});
    }

    async renderDashboard () {
        return this.render('dashboard', await this.getDashboard(), false);
    }

    async getDashboard () {
        let article = this.spawn(Article);
        let photo = this.spawn(Photo);
        let tag = this.spawn(Tag);
        let comment = this.spawn(Comment);
        return {
            'drafts': await article.find({'status': Article.STATUS_DRAFT}).count(),
            'published': await article.find({'status': Article.STATUS_PUBLISHED}).count(),
            'archived': await article.find({'status': Article.STATUS_ARCHIVED}).count(),
            'blocked': await article.find({'status': Article.STATUS_BLOCKED}).count(),
            'photos': await photo.find().count(),
            'tags': await tag.find().count(),
            'pending': await comment.find({'status': Comment.STATUS_PENDING}).count(),
            'approved': await comment.find({'status': Comment.STATUS_APPROVED}).count(),
            'rejected': await comment.find({'status': Comment.STATUS_REJECTED}).count()
        };
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Comment = require('../model/Comment');
const Photo = require('../model/Photo');
const Tag = require('../model/Tag');