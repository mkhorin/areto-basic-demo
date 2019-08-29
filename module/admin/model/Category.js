'use strict';

const Base = require('../../../model/Category');

module.exports = class Category extends Base {

    static getConstants () {
        return {
            RULES: [
                ['name', 'required'],
                ['name', 'filter', {filter: 'trim'}],
                ['name', 'string', {min: 2, max: 32}],
                ['name', 'unique', {ignoreCase: true}]
            ],
            UNLINK_ON_REMOVE: [
                'articles'
            ]
        };
    }

    findBySearch (text) {
        return text ? this.find(['LIKE', 'name', `%${text}%`]) : this.find();
    }

    findNames () {
        return this.find().select('name').order({name: 1}).raw();
    }

    relArticles () {
        return this.hasMany(Article, 'category', this.PK);
    }
};
module.exports.init(module);

const Article = require('./Article');