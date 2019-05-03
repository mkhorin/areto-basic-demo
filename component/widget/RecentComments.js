'use strict';

const Base = require('areto/view/Widget');

module.exports = class RecentComments extends Base {

    async run () {
        this.comments = await this.spawn(Comment).findRecent(3).all();
        return this.renderTemplate('_part/widget/recent-comments');
    }
};

const Comment = require('../../model/Comment');