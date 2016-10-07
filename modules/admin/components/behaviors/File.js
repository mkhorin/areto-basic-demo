'use strict';

let Base = require('areto/base/Behavior');
let helper = require('areto/helpers/MainHelper');
let path = require('path');
let fs = require('fs');
let gm = require('gm');
let mkdirp = require('mkdirp');
let async = require('async');

module.exports = class File extends Base {

    constructor (config) {
        super(Object.assign({
            // FileClass: require('../models/File'),
            fileAttr: 'file', // owner attribute with uploaded file
            // filenameAttr: 'filename', // owner attribute with filename
            // dirs can be public or private
            // storeDir: path.join(__dirname, '../uploads/files'),
            // thumbDir: path.join(__dirname, '../web/thumbs'),
            thumbExtension: 'jpg',
            quality: 50,
            // neededThumbs: [800, 400, 200],
            // if thumb max height does not match thumb max width
            // thumbHeights: { 128: 164, 200: 300 },
            // thumbResizeMethod: 'cropResizeImage',
            // watermark: { 800: path.join(__dirname, './common/data/watermark.png')}
            // afterProcessFile: (fileModel, cb)=> {}
        }, config));
    }

    init () {
        super.init();
        if (!this.defaultThumbSize && this.neededThumbs) {
            this.defaultThumbSize = this.neededThumbs[this.neededThumbs.length - 1];
        }
        this._events[ActiveRecord.EVENT_BEFORE_VALIDATE] = 'beforeValidate';
        this._events[ActiveRecord.EVENT_BEFORE_INSERT] = 'beforeInsert';
        this._events[ActiveRecord.EVENT_BEFORE_UPDATE] = 'beforeUpdate';
        this._events[ActiveRecord.EVENT_AFTER_DELETE] = 'afterDelete';
    }
  
    getPath () {
        return path.join(this.storeDir, this.getFilename());
    }

    getFilename () {
        return this.owner.get(this.filenameAttr) || '';
    }

    getThumbPath (size) {
        return path.join(this.thumbDir, this.getThumbName(size));
    }

    getThumbName (size) {
        return `${size}/${this.getFilename()}.${this.thumbExtension}`;
    }

    // EVENTS

    beforeValidate (event, cb) {
        let file = this.owner.get(this.fileAttr);
        if (file instanceof this.FileClass) {
            this.fileModel = file;
            this.owner.set(this.fileAttr, file.getFileStats());
            cb();
        } else if (file) {
            this.FileClass.findById(file).one((err, model)=> {
                if (model) {
                    this.fileModel = model;
                    this.owner.set(this.fileAttr, model.getFileStats());
                    cb();
                } else cb(err);
            });
        } else cb();
    }

    beforeInsert (event, cb) {
        this.fileModel ? this.checkFile(err => {
            err ? cb(err) : this.processFile(cb);
        }) : cb();
    }

    beforeUpdate (event, cb) {
        this.fileModel ? this.checkFile(err => {
            // remove old files before save new
            err ? cb(err) : this.removeFiles(()=> {
                this.processFile(cb);
            });
        }) : cb();
    }

    afterDelete (event, cb) {
        this.removeFiles(cb);
    }

    // PROCESS

    checkFile (cb) {
        if (this.fileModel) {
            let filePath = this.fileModel.getPath();
            fs.stat(filePath, (err, stats)=> {
                err ? cb(err) : stats.isFile() ? cb() : cb(`This is not file: ${filePath}`);
            });
        } else cb(`File model is not set`);
    }

    processFile (cb) {
        let filename = this.createFilename(this.fileModel);
        let destPath = path.join(this.storeDir, filename);
        mkdirp(path.dirname(destPath), err => {
            err ? cb(err) : fs.rename(this.fileModel.getPath(), destPath, err => {
                if (err) {
                    return cb(err);
                }
                this.owner.set(this.filenameAttr, filename);
                this.generateThumbs(err => {
                    err ? cb(err) : this.afterProcessFile ? this.afterProcessFile(this.fileModel, cb) : cb();
                });
            });
        });
    }

    createFilename (file) {
        return path.join(this.generateNestedDir(), file.get('filename'));
    }

    generateNestedDir () { // split by months
        let now = new Date;
        return now.getFullYear() +'-'+ ('0' + (now.getMonth() + 1)).slice(-2);
    }

    removeFiles (cb) {
        let paths = [this.getPath()];
        if (this.neededThumbs) {
            for (let thumb of this.neededThumbs)  {
                paths.push(this.getThumbPath(thumb));
            }
        }        
        async.each(paths, (path, cb)=> {
            fs.unlink(path, err => {
                err && this.owner.module.log('error', `File: removeFiles: ${path}`, err);
                cb(); // clear err
            });
        }, cb);
    }

    // THUMBS

    generateThumbs (cb) {
        if (this.neededThumbs instanceof Array && this.fileModel.isImage()) {
            let image = gm(this.getPath());
            async.eachSeries(this.neededThumbs, (width, cb)=> {
                this.createThumb(image, width, cb);
            }, cb);
        } else {
            cb();
        }
    }

    createThumb (image, width, cb) {
        try {
            let height = this.getThumbHeight(width);
            image.resize(width, height);
            // image.resize(width, height, '!'); // to override the image's proportions
            this.setWatermark(image, width, (err, image)=> {
                if (err) {
                    return cb(err);
                }
                let thumbPath = this.getThumbPath(width);
                mkdirp(path.dirname(thumbPath), err => {
                    // let start = (new Date).getTime();
                    image.quality(this.quality);
                    err ? cb(err) : image.write(thumbPath, err => {
                        // console.error('behaviors/File: createThumb: ' + ((new Date).getTime() - start));
                        err && this.owner.module.log('error', `File: createThumb: ${thumbPath}`, err);
                        cb(err);
                    });
                });
            });
        } catch (err) {
            cb(err);
        }
    }

    getThumbHeight (width) {
        return this.thumbHeights && this.thumbHeights[width] ? this.thumbHeights[width] : width;
    }

    setWatermark (image, width, cb) {
        if (this.watermark && this.watermark[width]) {
            try {
                image.draw([`image Over 0,0 0,0 ${this.watermark[width]}`]);
                cb(null, image);
            } catch (err) {
                cb(err);
            }
        } else cb(null, image);
    }
};

let ActiveRecord = require('areto/db/ActiveRecord');