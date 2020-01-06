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
            STORE_DIRECTORY: path.join(__dirname, '../upload/temp')
        };
    }

    findExpired (timeout = 3600) {
        const expired = new Date(Date.now() - parseInt(timeout) * 1000);
        return this.find(['<', 'updatedAt', expired]);
    }

    getTitle () {
        return `${this.get('originalName')} (${this.get('filename')})`;
    }

    isImage () {
        return this.get('mime').indexOf('image') === 0;
    }

    getPath () {
        return path.join(this.STORE_DIRECTORY, this.get('filename'));
    }

    async upload (req, res, user) {
        const uploader = this.createSingleUploader();
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
            destination: this.generateStoreDirectory.bind(this),
            filename: this.generateFilename.bind(this)
        });
    }

    generateStoreDirectory (req, file, callback) {
        fs.mkdir(this.STORE_DIRECTORY, {recursive: true}, err => callback(err, this.STORE_DIRECTORY));
    }

    generateFilename (req, file, callback) {
        callback(null, Date.now().toString() + SecurityHelper.getRandomString(11, 99));
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

    async afterDelete () {
        await super.afterDelete();
        await fs.promises.unlink(this.getPath());
    }
};
module.exports.init(module);

const fs = require('fs');
const multer = require('multer');
const PromiseHelper = require('areto/helper/PromiseHelper');
const SecurityHelper = require('areto/helper/SecurityHelper');