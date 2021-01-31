'use strict';

const Base = require('../../../model/Tag');

module.exports = class Tag extends Base {

    static getConstants () {
        return {
            RULES: [
                ['name', 'required'],
                ['name', 'filter', {method: 'trim'}],
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
        name = new RegExp(`^${name}$`, 'i');
        return this.find({name});
    }

    findBySearch (text) {
        return text
            ? this.find(['LIKE', 'name', `%${text}%`])
            : this.find();
    }

    relArticles () {
        return this.hasMany(Article, Article.PK, 'articleId').viaTable('rel_article_tag', 'tagId', this.PK);
    }
};
module.exports.init(module);

const EscapeHelper = require('areto/helper/EscapeHelper');
const Article = require('./Article');