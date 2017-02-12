'use strict';

let Base = require('areto/db/ActiveRecord');

module.exports = class Tag extends Base {

    static getConstants () {
        return {
            TABLE: 'tag',
            STORED_ATTRS: [
                'name'
            ],
            RULES: [
                ['name', 'required'],
                ['name', 'string', {min:2, max:32}]
            ]
        };
    }
    
    getTitle () {
        return this.get('name');
    }
    
    relArticles () {
        return this.hasMany(Article, [Article.PK, 'articleId'])
            .where({status: Article.STATUS_PUBLISHED})
            .with('mainPhoto', 'tags')
            .viaTable('rel_article_tag', ['tagId', this.PK]);
    }
};
module.exports.init(module);

let Article = require('./Article');