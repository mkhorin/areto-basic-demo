'use strict';

let Base = require('../../../models/Article');
let async = require('async');

module.exports = class Article extends Base {

    static getConstants () {
        return {
            STORED_ATTRIBUTES: [
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
                timestamp: require('areto/behaviors/Timestamp')
            },
            UNLINK_ON_REMOVE: ['photos']
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
        return this.find().select(['title']).asArray(true);
    }

    init () {
        super.init();
        this.set('status', this.STATUS_DRAFT);
        this.set('nComments', 0);
        this.set('rating', 0);
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

    afterSave (cb) {
        super.afterSave(err => {
            if (err) return cb(err);
            this.createPhotos(this.get('files'), cb);
        });
    }

    // TAGS

    validateTags (cb, attr, params) {
        try {
            let helper = require('areto/helpers/ArrayHelper');
            let items = this.get(attr).split(',');
            items = helper.unique(items.map(item => item.trim()).filter(item => item)); 
            this.unlinkAll('tags', err => {
                async.eachSeries(items, this.resolveTag.bind(this), cb);
            });
        } catch (err) {
            cb(err);
        }
    }

    resolveTag (item, cb) {
        Tag.findByName(item).one((err, model)=> {
            if (err) {
                cb(err);
            } else if (model) {
                this.link('tags', model, cb);
            } else {
                model = new Tag;
                model.set('name', item);
                model.save(err => {
                    model.isNewRecord ? cb(err) : this.link('tags', model, cb);
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
        return this.hasMany(Photo, ['articleId', this.PK], true);
    }
    
    relMainPhoto () {
        return this.hasOne(Photo, [Photo.PK, 'mainPhotoId']);
    }

    relComments () {
        return this.hasMany(Comment, ['articleId', this.PK], true);
    }

    relTags () {
        return this.hasMany(Tag, [Tag.PK, 'tagId'], true)
            .viaTable('rel_article_tag', ['articleId', this.PK]);
    }
};
module.exports.init(module);

let Comment = require('./Comment');
let Tag = require('./Tag');
let File = require('./File');
let Photo = require('./Photo');
let User = require('./User');