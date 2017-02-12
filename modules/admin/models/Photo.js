'use strict';

const Base = require('../../../models/Photo');
const path = require('path');

module.exports = class Photo extends Base {

    static getConstants () {
        return {
            TABLE: 'photo',
            STORED_ATTRS: [
                'title',
                'filename',
                'articleId'
            ],
            RULES: [
                ['title', 'string', {min: 3, max: 255}],
                ['file', 'required', {on: ['create']}],
                ['file', 'file', {onlyImage: true}],
                ['articleId', 'filter', {filter: 'ObjectId'}],
                ['articleId', 'exist', {
                    targetClass: require('./Article'),
                    targetAttr: this.PK
                }]
            ],
            BEHAVIORS: {
                photo: {
                    Class: require('../components/behaviors/ImageConverter'),
                    FileClass: require('./File'),
                    filenameAttr: 'filename',
                    storeDir: path.join(__dirname, '../uploads/photos'),
                    thumbDir: path.join(__dirname, '../../../web/photos'),
                    size: 720,
                    neededThumbs: [720, 360, 128],
                    watermark: {
                        720: path.join(__dirname, '../data/photo-watermark.png')
                    }
                }
            }
        };
    }
    
    relArticle () {
        return this.hasOne(Article, [Article.PK, 'articleId']);
    }
};
module.exports.init(module);

const Article = require('./Article');