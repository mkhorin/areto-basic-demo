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
            UNLINK_ON_REMOVE: ['articles']
        };
    }

    static findBySearch (text) {
        return text ? this.find(['LIKE', 'name', `%${text}%`]) : this.find();
    }

    static findNames () {
        return this.find().select('name').order({name:1}).asRaw();
    }

    relArticles () {
        return this.hasMany(Article, 'category', this.PK);
    }
};
module.exports.init(module);

const Article = require('./Article');