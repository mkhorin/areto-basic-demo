'use strict';

const Base = require('../component/BaseController');

module.exports = class DefaultController extends Base {

    actionIndex () {
        this.module.components.cache.use('dashboard', cb => {
            let Article = require('../model/Article');
            let Comment = require('../model/Comment');
            let Photo = require('../model/Photo');
            let Tag = require('../model/Tag');
            async.series({
                drafts: cb => Article.find({status: Article.STATUS_DRAFT}).count(cb),
                published: cb => Article.find({status: Article.STATUS_PUBLISHED}).count(cb),
                archived: cb => Article.find({status: Article.STATUS_ARCHIVED}).count(cb),
                blocked: cb => Article.find({status: Article.STATUS_BLOCKED}).count(cb),
                photos: cb => Photo.find().count(cb),
                tags: cb => Tag.find().count(cb),
                pending: cb => Comment.find({status: Comment.STATUS_PENDING}).count(cb),
                approved: cb => Comment.find({status: Comment.STATUS_APPROVED}).count(cb),
                rejected: cb => Comment.find({status: Comment.STATUS_REJECTED}).count(cb)
            }, (err, result)=> {
                err ? cb(err)
                    : this.render('index', result, cb);
            });
        }, (err, content)=> {
            err ? this.throwError(err)
                : this.send(content);
        });
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');