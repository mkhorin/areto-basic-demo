'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class Tag extends Base {

    static getConstants () {
        return {
            TABLE: 'tag',
            ATTRS: [
                'name'
            ],
            RULES: [
                ['name', 'required'],
                ['name', 'string', {min:2, max:32}]
            ]
        };
    }
    
    static findByName (name) {
        return this.find({name});
    }
    
    getTitle () {
        return this.get('name');
    }
    
    relArticles () {
        return this.hasMany(Article, Article.PK, 'articleId')
            .viaTable('rel_article_tag', 'tagId', this.PK)
            .and({status: Article.STATUS_PUBLISHED})
            .with('mainPhoto', 'tags');
    }
};
module.exports.init(module);

const Article = require('./Article');