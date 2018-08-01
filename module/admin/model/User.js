'use strict';

const Base = require('../../../model/User');

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
            ],
            ATTR_VALUE_LABELS: {
                'status': {
                    active: 'Active',
                    banned: 'Banned'
                },
                'role': {
                    reader: 'Reader',
                    author: 'Author',
                    editor: 'Editor',
                    moderator: 'Moderator',
                    admin: 'Administrator'
                }
            }
        };
    }

    static findBySearch (text) {
        if (!text) {
            return this.find();
        }
        return this.find(['OR',
            ['LIKE','name',`%${text}%`],
            ['LIKE','email',`%${text}%`]
        ]);
    }

    relArticles () {
        return this.hasMany(Article, 'authorId', this.PK);
    }
};
module.exports.init(module);

const Article = require('./Article');