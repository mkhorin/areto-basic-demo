'use strict';

const Base = require('../../../model/Photo');
const path = require('path');

module.exports = class Photo extends Base {

    static getConstants () {
        return {
            TABLE: 'photo',
            ATTRS: [
                'title',
                'filename',
                'articleId'
            ],
            RULES: [
                ['title', 'string', {min: 3, max: 255}],
                ['file', 'required', {on: ['create']}],
                ['file', 'image'],
                ['articleId', 'id'],
                ['articleId', 'exist', {
                    targetClass: require('./Article'),
                    targetAttr: this.PK
                }]
            ],
            BEHAVIORS: {
                'photo': {
                    Class: require('../component/behavior/ImageConverter'),
                    FileClass: require('./File'),
                    filenameAttr: 'filename',
                    storeDirectory: path.join(__dirname, '../upload/photo'),
                    previewDirectory: path.join(__dirname, '../../../web/photo'),
                    size: 720,
                    previews: [720, 360, 128],
                    watermark: {
                        720: path.join(__dirname, '../asset/photoWatermark.png')
                    }
                }
            }
        };
    }
    
    relArticle () {
        return this.hasOne(Article, Article.PK, 'articleId');
    }
};
module.exports.init(module);

const Article = require('./Article');