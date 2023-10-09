'use strict';

const Base = require('../../../model/Comment');

module.exports = class Comment extends Base {

    static getConstants () {
        return {
            RULES: [
                ...super.RULES,
                ['status', 'range', {values: [
                    this.STATUS_PENDING,
                    this.STATUS_APPROVED,
                    this.STATUS_REJECTED
                ]}]
            ],
            ATTR_VALUE_LABELS: {
                'status': {
                    [this.STATUS_PENDING]: 'Pending',
                    [this.STATUS_APPROVED]: 'Approved',
                    [this.STATUS_REJECTED]: 'Rejected'
                }
            }
        };
    }

    findByStatus (status) {
        return this.find({status});
    }

    findBySearch (text) {
        if (!text) {
            return this.createQuery();
        }
        return this.find(['or',
            ['like', 'content', `%${text}%`],
            {name: text},
            {email: text}
        ]);
    }

    relArticle () {
        return this.hasOne(Article, Article.PK, 'articleId');
    }
};
module.exports.init(module);

const Article = require('./Article');