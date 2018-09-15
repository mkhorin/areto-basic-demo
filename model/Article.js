'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class Article extends Base {

    static getConstants () {
        return {
            TABLE: 'article',           
            STATUS_DRAFT: 'draft',
            STATUS_PUBLISHED: 'published',
            STATUS_ARCHIVED: 'archived',
            STATUS_BLOCKED: 'blocked'
        };
    }

    static findPublishedByCategory (category) {
        return this.findPublished().and({category});
    }

    static findPublished () {
        return this.find({
            status: this.STATUS_PUBLISHED
        }).with('mainPhoto','tags');
    }

    static findBySearch (text) {
        let query = this.findPublished();
        if (text === '') {
            return query;
        }
        if (/[a-zа-я0-9\-\s]{1,32}/i.test(text)) {
            return query.and(['LIKE', 'title', `%${text}%`]);
        }
        return query.where(['FALSE']);
    }

    getTitle () {
        return this.get('title');
    }

    isDraft () {
        return this.get('status') === this.STATUS_DRAFT;
    }

    isPublished () {
        return this.get('status') === this.STATUS_PUBLISHED;
    }

    isArchived () {
        return this.get('status') === this.STATUS_ARCHIVED;
    }

    isBlocked () {
        return this.get('status') === this.STATUS_BLOCKED;
    }

    // RELATIONS

    relAuthor () {
        return this.hasOne(User, User.PK, 'authorId');
    }

    relCategory () {
        return this.hasOne(Category, Category.PK, 'category');
    }

    relPhotos () {
        return this.hasMany(Photo, 'articleId', this.PK);
    }
    
    relMainPhoto () {
        return this.hasOne(Photo, Photo.PK, 'mainPhotoId');
    }

    relComments () {
        return this.hasMany(Comment, 'articleId', this.PK).and({
            status: Comment.STATUS_APPROVED
        });
    }

    relTags () {
        return this.hasMany(Tag, Tag.PK, 'tagId')
            .viaTable('rel_article_tag', 'articleId', this.PK);
    }
};
module.exports.init(module);

const Category = require('./Category');
const Comment = require('./Comment');
const Photo = require('./Photo');
const User = require('./User');
const Tag = require('./Tag');