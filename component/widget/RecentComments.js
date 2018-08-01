'use strict';

const Base = require('areto/view/Widget');

module.exports = class RecentComments extends Base {

    run (cb) {
        async.waterfall([
            cb => Comment.findRecent(3).all(cb),
            (models, cb) => {
                this.comments = models;
                this.render('_part/widget/recent-comments', cb);
            }
        ], cb);
    }
};

const async = require('areto/helper/AsyncHelper');
const Comment = require('../../model/Comment');