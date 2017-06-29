'use strict';

const Base = require('../../../models/Article');

module.exports = class Article extends Base {

    static getConstants () {
        return {
            STORED_ATTRS: [
                'status',
                'authorId',
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
                ['status', 'range', {range: ['draft','published','archived','blocked']}],
                ['files', 'safe'],
                ['tags', 'validateTags', {skipOnAnyError: true}]
            ],
            BEHAVIORS: {
                'timestamp': require('areto/behaviors/TimestampBehavior')
            },
            UNLINK_ON_REMOVE: ['photos','comments']
        };
    }

    static findBySearch (text) {
        let query = this.find();
        if (typeof text === 'string' && /[a-z0-9\-\s]{1,32}/i.test(text)) {
            query.andWhere(['LIKE','title', `%${text}%`]);
        }
        return query;
    }
    
    static findToSelect () {
        return this.find().select(['title']).asArray();
    }

    init () {
        super.init();
        this.set('status', this.STATUS_DRAFT);
    }

    getStatusSelect () {
        return [
            { value: this.STATUS_DRAFT, label: 'Draft' },
            { value: this.STATUS_PUBLISHED, label: 'Published' },
            { value: this.STATUS_ARCHIVED, label: 'Archived' },
            { value: this.STATUS_BLOCKED, label: 'Blocked' }
        ];
    }

    // EVENTS
    
    beforeValidate (cb) {
        super.beforeValidate(err => {
            if (err) return cb(err);            
            this.resolveFiles(this.get('files'), cb);
        });                
    }

    afterSave (insert, cb) {
        super.afterSave(insert, err => {
            if (err) {
                return cb(err);
            }
            this.createPhotos(this.get('files'), cb);
        });
    }

    // TAGS

    validateTags (cb, attr, params) {
        try {
            let items = this.get(attr);
            if (typeof items === 'string') {
                let ArrayHelper = require('areto/helpers/ArrayHelper');
                items = ArrayHelper.unique(items.split(',').map(item => item.trim()).filter(item => item));
                this.unlinkAll('tags', err => {
                    async.eachSeries(items, this.resolveTag.bind(this), cb);
                });
            } else {
                cb();
            }
        } catch (err) {
            cb(err);
        }
    }

    resolveTag (name, cb) {
        Tag.findByName(name).one((err, model)=> {
            if (err) {
                cb(err);
            } else if (model) {
                this.link('tags', model, cb);
            } else {
                model = new Tag;
                model.set('name', name);
                model.save(err => {
                    model.isNewRecord() ? cb(err) : this.link('tags', model, cb);
                });
            }
        });
    }

    // PHOTOS

    resolveFiles (files, cb) {
        if (files && typeof files === 'string') {
            File.findById(files.split(',')).all((err, models)=> {
                if (err) {
                    return cb(err);
                }
                this.set('files', models);
                cb();
            });
        } else cb();
    }

    createPhotos (files, cb) {
        if (files instanceof Array) {
            let photos = [];
            async.each(files, (file, cb)=> {
                let photo = new Photo;
                photo.set('articleId', this.getId());
                photo.set('file', file);
                photo.save(err => {
                    err ? this.module.log('error', err) : photos.push(photo);
                    cb();
                });
            }, ()=> {
                // set first photo as main
                if (photos.length && !this.get('mainPhotoId')) {
                    this.set('files', null);
                    this.set('mainPhotoId', photos[0].getId());
                    this.forceSave(cb);
                } else cb();
            });
        } else cb();
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
        return this.hasMany(Comment, ['articleId', this.PK]).removeOnUnlink();
    }

    relTags () {
        return this.hasMany(Tag, [Tag.PK, 'tagId']).removeOnUnlink()
            .viaTable('rel_article_tag', ['articleId', this.PK]);
    }
};
module.exports.init(module);

const async = require('async');
const Comment = require('./Comment');
const Tag = require('./Tag');
const File = require('./File');
const Photo = require('./Photo');
const User = require('./User');