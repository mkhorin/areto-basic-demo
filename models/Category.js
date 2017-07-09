'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class Categoryy extends Base {

    static getConstants () {
        return {
            TABLE: 'category',
            STORED_ATTRS: [
                'name'
            ]
        };
    }
    
    getTitle () {
        return this.get('name');
    }
    
    relArticles () {
        return this.hasMany(Article, ['category', this.PK])
            .where({status: Article.STATUS_PUBLISHED})
            .with('mainPhoto', 'tags');
    }
};
module.exports.init(module);

const Article = require('./Article');