'use strict';

const Base = require('../../../model/Article');

module.exports = class Article extends Base {

    static getConstants () {
        return {
            ATTRS: [
                'status',
                'authorId',
                'category',
                'date',
                'title',
                'content',
                'mainPhotoId',
                'createdAt',
                'updatedAt'
            ],
            RULES: [                
                [['title', 'content', 'status', 'date'], 'required'],
                ['title', 'string', {min: 3, max: 128}],
                ['title', 'unique'],
                ['content', 'string', {min: 10, max: 16128}],
                ['date', 'date'],
                ['category', 'id'],
                ['status', 'range', {values: [
                    this.STATUS_DRAFT,
                    this.STATUS_PUBLISHED,
                    this.STATUS_ARCHIVED,
                    this.STATUS_BLOCKED
                ]}],
                ['status', 'default', {value: this.STATUS_DRAFT}],
                ['files', 'safe'],
                ['tags', 'validateTags', {skipOnAnyError: true}]
            ],
            BEHAVIORS: {
                'timestamp': require('areto/behavior/TimestampBehavior')
            },
            DELETE_ON_UNLINK: [
                'comments',
                'photos',
            ],
            UNLINK_ON_DELETE: [
                'tags'
            ],
            ATTR_VALUE_LABELS: {
                'status': {
                    [this.STATUS_DRAFT]: 'Draft',
                    [this.STATUS_PUBLISHED]: 'Published',
                    [this.STATUS_ARCHIVED]: 'Archived',
                    [this.STATUS_BLOCKED]: 'Blocked'
                }
            }
        };
    }

    findByStatus (status) {
        return this.find({status});
    }

    findBySearch (text) {
        const query = this.createQuery();
        if (typeof text === 'string' && /[a-z0-9а-я\-\s]{1,32}/i.test(text)) {
            query.and(['LIKE','title', `%${text}%`]);
        }
        return query;
    }
    
    findToSelect () {
        return this.createQuery().select('title').raw();
    }

    // EVENTS
    
    async beforeValidate () {
        await super.beforeValidate();
        await this.resolveFiles(this.get('files'));
    }

    async afterSave (insert) {
        await super.afterSave(insert);
        await this.createPhotos(this.get('files'));
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
        return this.hasMany(Comment, 'articleId', this.PK);
    }

    relTags () {
        return this.hasMany(Tag, Tag.PK, 'tagId').viaTable('rel_article_tag', 'articleId', this.PK);
    }

    // TAG

    async validateTags (attr) {
        let items = this.get(attr);
        if (typeof items !== 'string') {
            return;
        }
        items = items.split(',').map(item => item.trim()).filter(item => item);
        items = ArrayHelper.unique(items);
        await this.getLinker().unlinkAll('tags');
        for (const item of items) {
            await this.resolveTag(item);
        }
    }

    async resolveTag (name) {
        const tag = this.spawn(Tag);
        const model = await tag.findByName(name).one();
        if (model) {
            return this.getLinker().link('tags', model);
        }
        tag.set('name', name);
        if (await tag.save()) {
            await this.getLinker().link('tags', tag);
        }
    }

    // PHOTO

    async resolveFiles (files) {
        if (files && typeof files === 'string') {
            this.set('files', await this.spawn(File).findById(files.split(',')).all());
        }
    }

    async createPhotos (files) {
        if (!Array.isArray(files)) {
            return false;
        }
        const photos = [];
        for (const file of files) {
            const photo = await this.createPhoto(file);
            if (photo) {
                photos.push(photo);
            }
        }
        if (photos.length && !this.get('mainPhotoId')) {
            // set first photo as main
            this.set('mainPhotoId', photos[0].getId());
            this.set('files', null);
            await this.forceSave();
        }
    }

    async createPhoto (file) {
        const photo = this.spawn(Photo);
        photo.set('articleId', this.getId());
        photo.set('file', file);
        try {
            if (await photo.save()) {
                return photo;
            }
        } catch (err) {
            this.log('error', err);
        }
    }
};
module.exports.init(module);

const ArrayHelper = require('areto/helper/ArrayHelper');
const Category = require('./Category');
const Comment = require('./Comment');
const Tag = require('./Tag');
const File = require('./File');
const Photo = require('./Photo');
const User = require('./User');