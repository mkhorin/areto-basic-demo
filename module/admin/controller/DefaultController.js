'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    actionIndex () {
        async.waterfall([
            cb => this.module.components.cache.use('dashboard', this.renderDashboard.bind(this), cb),
            content => this.send(content)
        ], err => this.throwError(err));
    }

    renderDashboard (cb) {
        async.waterfall([
            cb => this.getDashboard(cb),
            result => this.render('index', result, cb)
        ], cb);
    }

    getDashboard (cb) {
        async.series({
            'drafts': cb => Article.find({
                status: Article.STATUS_DRAFT
            }).count(cb),
            'published': cb => Article.find({
                status: Article.STATUS_PUBLISHED
            }).count(cb),
            'archived': cb => Article.find({
                status: Article.STATUS_ARCHIVED
            }).count(cb),
            'blocked': cb => Article.find({
                status: Article.STATUS_BLOCKED
            }).count(cb),
            'photos': cb => Photo.find().count(cb),
            'tags': cb => Tag.find().count(cb),
            'pending': cb => Comment.find({
                status: Comment.STATUS_PENDING
            }).count(cb),
            'approved': cb => Comment.find({
                status: Comment.STATUS_APPROVED
            }).count(cb),
            'rejected': cb => Comment.find({
                status: Comment.STATUS_REJECTED
            }).count(cb)
        }, cb);
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const Article = require('../model/Article');
const Comment = require('../model/Comment');
const Photo = require('../model/Photo');
const Tag = require('../model/Tag');