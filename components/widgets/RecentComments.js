'use strict';

const Base = require('areto/base/Widget');

module.exports = class RecentComments extends Base {

    run (cb) {
        async.waterfall([
            cb => Comment.findApproved().order({[Comment.PK]: - 1}).limit(3).all(cb),
            (models, cb) => {
                this.comments = models;
                this.render('_parts/widgets/recent-comments', cb);
            }
        ], cb);
    }
};

const async = require('async');
const Comment = require('../../models/Comment');