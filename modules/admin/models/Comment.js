'use strict';

const Base = require('../../../models/Comment');

module.exports = class Comment extends Base {

    static getConstants () {
        return {
            RULES: this.RULES.concat([
                ['status', 'range', {range: ['pending','approved','rejected']}]
            ])
        };
    }

    static findBySearch (text) {
        let query = this.find();
        if (text) {
            query.and(['OR',
                ['LIKE', 'content', `%${text}%`],
                {name: text},
                {email: text}
            ]);
        }
        return query;
    }

    getStatusSelect () {
        return [
            {value: this.STATUS_PENDING, label: 'Pending'},
            {value: this.STATUS_APPROVED, label: 'Approved'},
            {value: this.STATUS_REJECTED, label: 'Rejected'}
        ];
    }

    relArticle () {
        return this.hasOne(Article, Article.PK, 'articleId');
    }
};
module.exports.init(module);

const Article = require('./Article');