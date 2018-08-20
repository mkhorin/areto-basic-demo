'use strict';

const Base = require('areto/base/Behavior');

module.exports = class File extends Base {

    constructor (config) {
        super(Object.assign({
            // FileClass: require('../model/File'),
            fileAttr: 'file', // owner attr with uploaded file
            // filenameAttr: 'filename', // owner attr with filename
            // dirs can be public or private
            // storeDir: path.join(__dirname, '../upload/files'),
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
        
        if (!this.defaultThumbSize && this.neededThumbs) {
            this.defaultThumbSize = this.neededThumbs[this.neededThumbs.length - 1];
        }
        this.assign(ActiveRecord.EVENT_BEFORE_VALIDATE, this.beforeValidate);
        this.assign(ActiveRecord.EVENT_BEFORE_INSERT, this.beforeInsert);
        this.assign(ActiveRecord.EVENT_BEFORE_UPDATE, this.beforeUpdate);
        this.assign(ActiveRecord.EVENT_AFTER_REMOVE, this.afterRemove);
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

    beforeValidate (cb) {
        let file = this.owner.get(this.fileAttr);
        if (file instanceof this.FileClass) {
            this.fileModel = file;
            this.owner.set(this.fileAttr, file.getFileStats());
            return cb();
        }
        if (!file) {
            return cb();
        }
        async.waterfall([
            cb => this.FileClass.findById(file).one(cb),
            (model, cb)=> {
                if (model) {
                    this.owner.set(this.fileAttr, model.getFileStats());
                }
                this.fileModel = model;
                cb();
            }
        ], cb);
    }

    beforeInsert (cb) {
        if (!this.fileModel) {
            return cb();
        }
        async.series([
            cb => this.checkFile(cb),
            cb => this.processFile(cb)
        ], cb);
    }

    beforeUpdate (cb) {
        if (!this.fileModel) {
            return cb();
        }
        async.series([
            cb => this.checkFile(cb),
            cb => this.removeFiles(()=> cb()), // skip error
            cb => this.processFile(cb)
        ], cb);
    }

    afterRemove (cb) {
        this.removeFiles(cb);
    }

    // PROCESS

    checkFile (cb) {
        if (!this.fileModel) {
            return cb(`File model is not set`);
        }
        let filePath = this.fileModel.getPath();
        async.waterfall([
            cb => fs.stat(filePath, cb),
            (stat, cb)=> stat.isFile()
                ? cb()
                : cb(`This is not file: ${filePath}`)
        ], cb);
    }

    processFile (cb) {
        let filename = this.createFilename(this.fileModel);
        let destPath = path.join(this.storeDir, filename);
        async.series([
            cb => mkdirp(path.dirname(destPath), cb),
            cb => fs.rename(this.fileModel.getPath(), destPath, cb),
            cb => {
                this.owner.set(this.filenameAttr, filename);
                this.generateThumbs(cb);
            },
            cb => this.afterProcessFile
                ? this.afterProcessFile(this.fileModel, cb)
                : cb()
        ], cb);
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
        async.eachSeries(paths, (path, cb)=> {
            fs.unlink(path, err => {
                if (err) {
                    this.owner.module.log('error', `File remove failed: ${path}`, err);
                }
                cb(); // clear error
            });
        }, cb);
    }

    // THUMBS

    generateThumbs (cb) {
        if (!(this.neededThumbs instanceof Array) || !this.fileModel.isImage()) {
            return cb();
        }
        let image = gm(this.getPath());
        async.eachSeries(this.neededThumbs, (width, cb)=> {
            this.createThumb(image, width, cb);
        }, cb);
    }

    createThumb (image, width, cb) {
        try {
            let height = this.getThumbHeight(width);
            image.resize(width, height);
            // image.resize(width, height, '!'); // to override the image's proportions
        } catch (err) {
            return cb(err);
        }
        async.waterfall([
            cb => this.setWatermark(image, width, cb),
            (result, cb)=> {
                image = result;
                mkdirp(path.dirname(this.getThumbPath(width)), cb);
            },
            (dir, cb)=> {
                image.quality(this.quality);
                image.write(this.getThumbPath(width), cb);
            }
        ], cb);
    }

    getThumbHeight (width) {
        return this.thumbHeights && this.thumbHeights[width]
            ? this.thumbHeights[width]
            : width;
    }

    setWatermark (image, width, cb) {
        if (!this.watermark || !this.watermark[width]) {
            return cb(null, image);
        }
        try {
            image.draw([`image Over 0,0 0,0 ${this.watermark[width]}`]);
        } catch (err) {
            return cb(err);
        }
        cb(null, image);
    }
};

const async = require('areto/helper/AsyncHelper');
const fs = require('fs');
const gm = require('gm');
const mkdirp = require('mkdirp');
const path = require('path');
const ActiveRecord = require('areto/db/ActiveRecord');