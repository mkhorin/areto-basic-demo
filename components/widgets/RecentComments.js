'use strict';

let Base = require('areto/base/Widget');

module.exports = class RecentComments extends Base {

    run (cb) {
        Comment.find({
            status: Comment.STATUS_APPROVED
        }).orderBy({
            createdAt: 'DESC'
        }).limit(3).all((err, models)=> {
            if (err) {
                cb(err);
            } else {
                this.comments = models;
                this.render('_parts/widgets/recent-comments', cb);
            }
        });
    }
};

let Comment = require('../../models/Comment');