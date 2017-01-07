'use strict';

let Base = require('../components/Controller');
let async = require('async');

module.exports = class DefaultController extends Base {

    actionIndex () {
        this.module.components.cache.use('dashboard', cb => {
            let Article = require('../models/Article');
            let Comment = require('../models/Comment');
            let Photo = require('../models/Photo');
            let Tag = require('../models/Tag');
            async.series({
                drafts: cb => Article.find().where({status: Article.STATUS_DRAFT}).count(cb),
                published: cb => Article.find().where({status: Article.STATUS_PUBLISHED}).count(cb),
                archived: cb => Article.find().where({status: Article.STATUS_ARCHIVED}).count(cb),
                blocked: cb => Article.find().where({status: Article.STATUS_BLOCKED}).count(cb),
                photos: cb => Photo.find().count(cb),
                tags: cb => Tag.find().count(cb),
                pending: cb => Comment.find().where({status: Comment.STATUS_PENDING}).count(cb),
                approved: cb => Comment.find().where({status: Comment.STATUS_APPROVED}).count(cb),
                rejected: cb => Comment.find().where({status: Comment.STATUS_REJECTED}).count(cb)
            }, (err, result)=> {
                err ? cb(err) : this.render('index', result, cb);
            });
        }, (err, content)=> {
            err ? this.throwError(err) : this.send(content);
        });
    }
};
module.exports.init(module);