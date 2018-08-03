'use strict';

const Base = require('../../../model/Tag');

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
        return text
            ? this.find(['LIKE', 'name', `%${text}%`])
            : this.find();
    }

    relArticles () {
        return this.hasMany(Article, Article.PK, 'articleId')
            .viaTable('rel_article_tag', 'tagId', this.PK)
            .removeOnUnlink();
    }
};
module.exports.init(module);

const Article = require('./Article');