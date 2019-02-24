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
                ['status', 'range', {range: [
                    this.STATUS_DRAFT,
                    this.STATUS_PUBLISHED,
                    this.STATUS_ARCHIVED,
                    this.STATUS_BLOCKED
                ]}],
                ['files', 'safe'],
                ['tags', 'validateTags', {skipOnAnyError: true}]
            ],
            BEHAVIORS: {
                'timestamp': require('areto/behavior/TimestampBehavior')
            },
            UNLINK_ON_REMOVE: [
                'photos',
                'comments',
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

    static findBySearch (text) {
        let query = this.find();
        if (typeof text === 'string' && /[a-z0-9\-\s]{1,32}/i.test(text)) {
            query.and(['LIKE','title', `%${text}%`]);
        }
        return query;
    }
    
    static findToSelect () {
        return this.find().select('title').asRaw();
    }

    constructor (config) {
        super(config);
        this.set('status', this.STATUS_DRAFT);
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
        return this.hasMany(Photo, 'articleId', this.PK)
            .removeOnUnlink();
    }
    
    relMainPhoto () {
        return this.hasOne(Photo, Photo.PK, 'mainPhotoId');
    }

    relComments () {
        return this.hasMany(Comment, 'articleId', this.PK)
            .removeOnUnlink();
    }

    relTags () {
        return this.hasMany(Tag, Tag.PK, 'tagId')
            .viaTable('rel_article_tag', 'articleId', this.PK)
            .removeOnUnlink();
    }

    // TAG

    async validateTags (attr, params) {
        let items = this.get(attr);
        if (typeof items !== 'string') {
            return;
        }
        items = items.split(',').map(item => item.trim()).filter(item => item);
        items = ArrayHelper.unique(items);
        await this.unlinkAll('tags');
        for (let item of items) {
            await this.resolveTag(item);
        }
    }

    async resolveTag (name) {
        let model = await Tag.findByName(name).one();
        if (model) {
            return this.link('tags', model);
        }
        model = new Tag;
        model.set('name', name);
        if (await model.save()) {
            await this.link('tags', model);
        }
    }

    // PHOTO

    async resolveFiles (files) {
        if (files && typeof files === 'string') {
            this.set('files', await File.findById(files.split(',')).all());
        }
    }

    async createPhotos (files) {
        if (!(files instanceof Array)) {
            return false;
        }
        let photos = [];
        for (let file of files) {
            let photo = await this.createPhoto(file);
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
        let photo = new Photo;
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