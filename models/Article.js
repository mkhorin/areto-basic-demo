'use strict';

let Base = require('areto/db/ActiveRecord');

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

    static findPublished () {
        return this.find().where({status: this.STATUS_PUBLISHED}).with('mainPhoto','tags');
    }

    static findBySearch (text) {
        let query = this.findPublished();
        if (typeof text === 'string' && /[a-z0-9\-\s]{1,32}/i.test(text)) {
            query.andWhere(['LIKE', 'title', `%${text}%`]);
        }
        return query;
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
        return this.hasOne(User, [User.PK, 'authorId']);
    }

    relPhotos () {
        return this.hasMany(Photo, ['articleId', this.PK]);
    }
    
    relMainPhoto () {
        return this.hasOne(Photo, [Photo.PK, 'mainPhotoId']);
    }

    relComments () {
        return this.hasMany(Comment, ['articleId', this.PK])
            .where({status: Comment.STATUS_APPROVED});
    }

    relTags () {
        return this.hasMany(Tag, [Tag.PK, 'tagId'])
            .viaTable('rel_article_tag', ['articleId', this.PK]);
    }
};
module.exports.init(module);

let Comment = require('./Comment');
let Photo = require('./Photo');
let User = require('./User');
let Tag = require('./Tag');