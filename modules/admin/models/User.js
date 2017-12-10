'use strict';

const Base = require('../../../models/User');

module.exports = class User extends Base {

    static getConstants () {
        return {
            RULES: [
                [['name', 'email', 'role', 'status'], 'required'],
                ['password', 'required', {on: ['create']}],
                ['status', 'range', {range: ['pending', 'active', 'banned']}],
                ['role', 'range', {range: ['reader', 'author', 'editor', 'moderator', 'admin']}],
                ['name', 'string', {min: 3, max: 24}],
                ['name', 'regexp', {pattern: /^[а-яa-z\s-]+$/i}],
                ['email', 'email'],
                ['password', 'string', {min: 6, max: 32}],
                [['email', 'name'], 'unique', { ignoreCase: true }]
            ]
        };
    }

    static findBySearch (text) {
        let query = this.find();
        if (text) {
            query.and(['OR',
                ['LIKE','name',`%${text}%`],
                ['LIKE','email',`%${text}%`]
            ]);
        }
        return query;
    }

    getStatusSelect () {
        return [
            {value: 'active', label: 'Active'},
            {value: 'banned', label: 'Banned'}
        ];
    }

    getRoleSelect () {
        return [
            {value: 'reader', label: 'Reader'},
            {value: 'author', label: 'Author'},
            {value: 'editor', label: 'Editor'},
            {value: 'moderator', label: 'Moderator'},
            {value: 'admin', label: 'Administrator'}
        ];
    }

    relArticles () {
        return this.hasMany(Article, ['authorId', this.PK]);
    }
};
module.exports.init(module);

const Article = require('./Article');