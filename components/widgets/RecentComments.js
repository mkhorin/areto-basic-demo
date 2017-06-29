'use strict';

const Base = require('areto/base/Widget');

module.exports = class RecentComments extends Base {

    run (cb) {
        Comment.find({
            status: Comment.STATUS_APPROVED
        }).orderBy({
            [Comment.PK]: -1
        }).limit(3).all((err, models)=> {
            if (err) {
                return cb(err);
            }
            this.comments = models;
            this.render('_parts/widgets/recent-comments', cb);
        });
    }
};

const Comment = require('../../models/Comment');