'use strict';

let Base = require('areto/db/ActiveRecord');
let path = require('path');

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
                timestamp: {
                    Class: require('areto/behaviors/Timestamp'),
                    updatedAttr: false
                }
            },
            STORE_DIR: path.join(__dirname, '../uploads/temp')
        };
    }

    static findExpired (elapsedSeconds = 3600) {
        let expired = new Date;
        expired.setSeconds(expired.getSeconds() - elapsedSeconds);
        return this.find(['<', 'createdAt', expired]);
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
        multer({
            storage: multer.diskStorage({
                destination: this.generateStoreDir.bind(this),
                filename: this.generateFilename.bind(this)
            })
        }).single('file')(req, controller.res, err => {
            if (err) {
                cb(err);
            } else {
                this.populateFileStats(req.file, controller);
                this.set('file', this.getFileStats());
                this.save(cb);
            }
        });
    }

    generateStoreDir (req, file, cb) {
        mkdirp(this.STORE_DIR, err => {
            cb(err, this.STORE_DIR);
        });
    }

    generateFilename (req, file, cb) {
        cb(null, Date.now().toString() + helper.getRandom(11, 99));
    }

    populateFileStats (file, controller) {
        this.set('userId', controller.user.getId());
        this.set('originalName', file.originalname);
        this.set('filename', file.filename);
        this.set('mime', file.mimetype);
        this.set('extension', path.extname(file.originalname).substring(1).toLowerCase());
        this.set('size', file.size);
        this.set('ip', controller.req.ip);
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

    afterDelete (cb) {
        super.afterDelete(err => {
            err ? cb(err) : fs.unlink(this.getPath(), cb);
        });
    }
};
module.exports.init(module);

let helper = require('areto/helpers/MainHelper');
let fs = require('fs');
let multer = require('multer');
let mkdirp = require('mkdirp');