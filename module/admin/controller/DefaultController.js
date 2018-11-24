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
        return {
            'drafts': await Article.find({
                status: Article.STATUS_DRAFT
            }).count(),
            'published': await Article.find({
                status: Article.STATUS_PUBLISHED
            }).count(),
            'archived': await Article.find({
                status: Article.STATUS_ARCHIVED
            }).count(),
            'blocked': await Article.find({
                status: Article.STATUS_BLOCKED
            }).count(),
            'photos': await Photo.find().count(),
            'tags': await Tag.find().count(),
            'pending': await Comment.find({
                status: Comment.STATUS_PENDING
            }).count(),
            'approved': await Comment.find({
                status: Comment.STATUS_APPROVED
            }).count(),
            'rejected': await Comment.find({
                status: Comment.STATUS_REJECTED
            }).count()
        };
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Comment = require('../model/Comment');
const Photo = require('../model/Photo');
const Tag = require('../model/Tag');