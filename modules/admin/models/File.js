'use strict';

const Base = require('areto/db/ActiveRecord');
const path = require('path');

module.exports = class File extends Base {

    static getConstants () {
        return {
            TABLE: 'file',
            STORED_ATTRS: [
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
                    Class: require('areto/behaviors/TimestampBehavior'),
                    updatedAttr: false
                }
            },
            STORE_DIR: path.join(__dirname, '../uploads/temp')
        };
    }

    static findExpired (timeout = 3600) {
        let expired = new Date((new Date).getTime() - timeout * 1000);
        return this.find().where(['<', 'updatedAt', expired]);
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

    upload (controller, cb) {
        let req = controller.req;
        async.series([
            cb => multer({
                storage: multer.diskStorage({
                    destination: this.generateStoreDir.bind(this),
                    filename: this.generateFilename.bind(this)
                })
            }).single('file')(req, controller.res, cb),
            cb => {
                this.populateFileStats(req.file, controller);
                this.set('file', this.getFileStats());
                this.save(cb);
            }
        ], cb);
    }

    generateStoreDir (req, file, cb) {
        mkdirp(this.STORE_DIR, err => cb(err, this.STORE_DIR));
    }

    generateFilename (req, file, cb) {
        cb(null, Date.now().toString() + MainHelper.getRandom(11, 99));
    }

    populateFileStats (file, controller) {
        this.setAttrs({
            userId: controller.user.getId(),
            originalName: file.originalname,
            filename: file.filename,
            mime: file.mimetype,
            extension: path.extname(file.originalname).substring(1).toLowerCase(),
            size: file.size,
            ip: controller.req.ip
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

    afterRemove (cb) {
        async.series([
            cb => super.afterRemove(cb),
            cb => fs.unlink(this.getPath(), cb)
        ], cb);
    }
};
module.exports.init(module);

const async = require('async');
const fs = require('fs');
const multer = require('multer');
const mkdirp = require('mkdirp');
const MainHelper = require('areto/helpers/MainHelper');