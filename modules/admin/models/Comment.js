'use strict';

let Base = require('../../../models/Comment');

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
            query.where(['OR', ['LIKE', 'content', `%${text}%`], {'name': text}, {'email': text}]);
        }
        return query;
    }

    relArticle () {
        return this.hasOne(Article, [Article.PK, 'articleId']);
    }
};
module.exports.init(module);

let Article = require('./Article');