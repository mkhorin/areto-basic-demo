'use strict';

let Base = require('../../../models/Tag');

module.exports = class Tag extends Base {

    static getConstants () {
        return {
            RULES: [
                ['name', 'required'],
                ['name', 'filter', {filter: 'trim'}],
                ['name', 'string', {min: 2, max: 32}],
                ['name', 'unique', {ignoreCase: true}]
            ],
            INDEXES: [[{name: 1}, {unique: true}]],
            UNLINK_ON_REMOVE: ['articles']
        };
    }

    static findByName (name) {
        return this.find({name: new RegExp(`^${name}$`, 'i')});
    }

    static findBySearch (text) {
        let query = this.find();
        if (text) {
            query.where(['LIKE', 'name', `%${text}%`]);
        }
        return query;
    }

    relArticles () {
        return this.hasMany(Article, [Article.PK, 'articleId'], true)
            .viaTable('rel_article_tag', ['tagId', this.PK]);
    }
};
module.exports.init(module);

let Article = require('./Article');