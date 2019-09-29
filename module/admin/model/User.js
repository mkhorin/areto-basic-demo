'use strict';

const Base = require('../../../model/User');

module.exports = class User extends Base {

    static getConstants () {
        return {
            RULES: [
                [['name', 'email', 'role', 'status'], 'required'],
                ['password', 'required', {on: ['create']}],
                ['status', 'range', {range: [
                    this.STATUS_PENDING,
                    this.STATUS_ACTIVE,
                    this.STATUS_BANNED
                ]}],
                ['role', 'range', {range: [
                    this.ROLE_READER,
                    this.ROLE_AUTHOR,
                    this.ROLE_EDITOR,
                    this.ROLE_MODERATOR,
                    this.ROLE_ADMIN
                ]}],
                ['name', 'string', {min: 3, max: 24}],
                ['name', 'regex', {pattern: /^[a-zа-я\s-]+$/i}],
                ['email', 'email'],
                ['password', 'string', {min: 6, max: 32}],
                [['email', 'name'], 'unique', {ignoreCase: true}]
            ],
            ATTR_VALUE_LABELS: {
                status: {
                    [this.STATUS_ACTIVE]: 'Active',
                    [this.STATUS_BANNED]: 'Banned'
                },
                role: {
                    [this.ROLE_READER]: 'Reader',
                    [this.ROLE_AUTHOR]: 'Author',
                    [this.ROLE_EDITOR]: 'Editor',
                    [this.ROLE_MODERATOR]: 'Moderator',
                    [this.ROLE_ADMIN]: 'Administrator'
                }
            }
        };
    }

    findBySearch (text) {
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