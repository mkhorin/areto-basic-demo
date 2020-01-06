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
            UNLINK_ON_DELETE: [
                'articles'
            ]
        };
    }

    findByName (name) {
        name = EscapeHelper.escapeRegex(name);
        return this.find({name: new RegExp(`^${name}$`, 'i')});
    }

    findBySearch (text) {
        return text
            ? this.find(['LIKE', 'name', `%${text}%`])
            : this.find();
    }

    relArticles () {
        return this.hasMany(Article, Article.PK, 'articleId')
            .viaTable('rel_article_tag', 'tagId', this.PK)
            .deleteOnUnlink();
    }
};
module.exports.init(module);

const EscapeHelper = require('areto/helper/EscapeHelper');
const Article = require('./Article');