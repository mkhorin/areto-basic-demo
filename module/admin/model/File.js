'use strict';

const Base = require('areto/db/ActiveRecord');
const path = require('path');

module.exports = class File extends Base {

    static getConstants () {
        return {
            TABLE: 'file',
            ATTRS: [
                'userId',
                'originalName',
                'filename',
                'mime',
                'extension',
                'size',
                'ip',
                'createdAt'
            ],
            RULES: [
                ['file', 'required'],
                ['file', 'file']
            ],
            BEHAVIORS: {
                'timestamp': {
                    Class: require('areto/behavior/TimestampBehavior'),
                    updatedAttr: false
                }
            },
            STORE_DIR: path.join(__dirname, '../upload/temp')
        };
    }

    findExpired (timeout = 3600) {
        let expired = new Date(Date.now() - parseInt(timeout) * 1000);
        return this.find(['<', 'updatedAt', expired]);
    }

    getTitle () {
        return `${this.get('originalName')} (${this.get('filename')})`;
    }

    isImage () {
        return this.get('mime').indexOf('image') === 0;
    }

    getPath () {
        return path.join(this.STORE_DIR, this.get('filename'));
    }

    async upload (req, res, user) {
        let uploader = this.createSingleUploader();
        await PromiseHelper.promise(uploader.bind(this, req, res));
        this.populateFileStats(req.file, req, user);
        this.set('file', this.getFileStats());
        return this.save();
    }
    
    createSingleUploader () {
        return multer({storage: this.createUploaderStorage()}).single('file');
    }

    createUploaderStorage () {
        return multer.diskStorage({
            destination: this.generateStoreDir.bind(this),
            filename: this.generateFilename.bind(this)
        });
    }

    generateStoreDir (req, file, callback) {
        fs.mkdir(this.STORE_DIR, {recursive: true}, err => callback(err, this.STORE_DIR));
    }

    generateFilename (req, file, callback) {
        callback(null, Date.now().toString() + CommonHelper.getRandom(11, 99));
    }

    populateFileStats (file, req, user) {
        this.setAttrs({
            userId: user.getId(),
            originalName: file.originalname,
            filename: file.filename,
            mime: file.mimetype,
            extension: path.extname(file.originalname).substring(1).toLowerCase(),
            size: file.size,
            ip: req.ip
        });
    }

    getFileStats () {
        return {
            model: this,
            path: this.getPath(),
            size: this.get('size'),
            extension: this.get('extension'),
            mime: this.get('mime')
        };
    }

    // EVENTS

    async afterRemove () {
        await super.afterRemove();
        await fs.promises.unlink(this.getPath());
    }
};
module.exports.init(module);

const fs = require('fs');
const multer = require('multer');
const CommonHelper = require('areto/helper/CommonHelper');
const PromiseHelper = require('areto/helper/PromiseHelper');