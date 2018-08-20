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
            UNLINK_ON_REMOVE: ['photos','comments'],
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
        return this.find().select({title: 1}).asRaw();
    }

    constructor (config) {
        super(config);
        this.set('status', this.STATUS_DRAFT);
    }

    // EVENTS
    
    beforeValidate (cb) {
        async.series([
            cb => super.beforeValidate(cb),
            cb => this.resolveFiles(this.get('files'), cb)
        ], cb);
    }

    afterSave (insert, cb) {
        async.series([
            cb => super.afterSave(insert, cb),
            cb => this.createPhotos(this.get('files'), cb)
        ], cb);
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
        return this.hasMany(Comment, 'articleId', this.PK)
            .removeOnUnlink();
    }

    relTags () {
        return this.hasMany(Tag, Tag.PK, 'tagId')
            .viaTable('rel_article_tag', 'articleId', this.PK)
            .removeOnUnlink();
    }

    // TAG

    validateTags (cb, attr, params) {
        let items = this.get(attr);
        if (typeof items !== 'string') {
            return cb();
        }
        items = items.split(',').map(item => item.trim()).filter(item => item);
        items = ArrayHelper.unique(items);
        async.series([
            cb => this.unlinkAll('tags', cb),
            cb => async.eachSeries(items, this.resolveTag.bind(this), cb)
        ], cb);
    }

    resolveTag (name, cb) {
        async.waterfall([
            cb => Tag.findByName(name).one(cb),
            (model, cb)=> {
                if (model) {
                    return this.link('tags', model, cb);
                }
                model = new Tag;
                model.set('name', name);
                model.save(cb);
            },
            (model, cb)=> model.hasError()
                ? cb()
                : this.link('tags', model, cb)
        ], cb);
    }

    // PHOTO

    resolveFiles (files, cb) {
        if (!files || typeof files !== 'string') {
            return cb();
        }
        async.waterfall([
            cb => File.findById(files.split(',')).all(cb),
            (models, cb)=> {
                this.set('files', models);
                setImmediate(cb);
            }
        ], cb);
    }

    createPhotos (files, cb) {
        if (!(files instanceof Array)) {
            return cb();
        }
        let photos = [];
        async.eachSeries(files, (file, cb)=> {
            let photo = new Photo;
            photo.set('articleId', this.getId());
            photo.set('file', file);
            photo.save(err => {
                err ? this.module.log('error', err)
                    : photos.push(photo);
                setImmediate(cb);
            });
        }, ()=> {
            if (!photos.length || this.get('mainPhotoId')) {
                return cb();
            }
            // set first photo as main
            this.set('files', null);
            this.set('mainPhotoId', photos[0].getId());
            this.forceSave(cb);
        });
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const ArrayHelper = require('areto/helper/ArrayHelper');
const Category = require('./Category');
const Comment = require('./Comment');
const Tag = require('./Tag');
const File = require('./File');
const Photo = require('./Photo');
const User = require('./User');