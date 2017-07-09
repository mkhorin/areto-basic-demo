'use strict';

const Base = require('../../../models/Category');

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
        let query = this.find();
        if (text) {
            query.where(['LIKE', 'name', `%${text}%`]);
        }
        return query;
    }

    relArticles () {
        return this.hasMany(Article, ['category', this.PK]);
    }
};
module.exports.init(module);

const async = require('async');
const Article = require('./Article');