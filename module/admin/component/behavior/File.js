'use strict';

const Base = require('areto/base/Behavior');

module.exports = class File extends Base {

    constructor (config) {
        super({
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
            // afterProcessFile: async (fileModel)
            ...config
        });
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

    async beforeValidate () {
        let file = this.owner.get(this.fileAttr);
        if (file instanceof this.FileClass) {
            this.fileModel = file;
            this.owner.set(this.fileAttr, file.getFileStats());
        } else if (file) {
            this.fileModel = await this.FileClass.findById(file).one();
            if (this.fileModel) {
                this.owner.set(this.fileAttr, this.fileModel.getFileStats());
            }
        }
    }

    async beforeInsert () {
        if (this.fileModel) {
            this.checkFile();
            await this.processFile();
        }
    }

    async beforeUpdate () {
        if (this.fileModel) {
            this.checkFile();
            this.removeFiles();
            await this.processFile();
        }
    }

    afterRemove () {
        this.removeFiles();
    }

    // PROCESS

    checkFile () {
        if (!this.fileModel) {
            throw new Error(`File model is not set`);
        }
        let filePath = this.fileModel.getPath();
        let stat = fs.statSync(filePath);
        if (!stat.isFile()) {
            throw new Error(`This is not file: ${filePath}`);
        }
    }

    async processFile () {
        let filename = this.createFilename(this.fileModel);
        let destPath = path.join(this.storeDir, filename);
        mkdirp.sync(path.dirname(destPath));
        fs.renameSync(this.fileModel.getPath(), destPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generateThumbs();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }

    createFilename (file) {
        return path.join(this.generateNestedDir(), file.get('filename'));
    }

    generateNestedDir () { // split by months
        let now = new Date;
        return now.getFullYear() +'-'+ ('0' + (now.getMonth() + 1)).slice(-2);
    }

    removeFiles () {
        for (let thumbPath of this.getThumbPaths()) {
            try {
                fs.unlinkSync(thumbPath);
            } catch (err) {
                this.owner.log('error', `File remove failed: ${thumbPath}`, err);
            }
        }
    }

    // THUMBS

    getThumbPaths () {
        let paths = [this.getPath()];
        if (this.neededThumbs) {
            for (let thumb of this.neededThumbs)  {
                paths.push(this.getThumbPath(thumb));
            }
        }
        return paths;
    }

    async generateThumbs () {
        if (this.neededThumbs instanceof Array && this.fileModel.isImage()) {
            let image = gm(this.getPath());
            for (let width of this.neededThumbs) {
                await this.createThumb(image, width);
            }
        }
    }

    createThumb (image, width) {
        let height = this.getThumbHeight(width);
        image.resize(width, height);
        // image.resize(width, height, '!'); // to override the image's proportions
        this.setWatermark(image, width);
        mkdirp.sync(path.dirname(this.getThumbPath(width)));
        image.quality(this.quality);
        let thumbPath = this.getThumbPath(width);
        return PromiseHelper.promise(image.write.bind(image, thumbPath));
    }

    getThumbHeight (width) {
        return this.thumbHeights && this.thumbHeights[width]
            ? this.thumbHeights[width]
            : width;
    }

    setWatermark (image, width) {
        if (this.watermark && this.watermark[width]) {
            image.draw([`image Over 0,0 0,0 ${this.watermark[width]}`]);
        }
    }
};

const fs = require('fs');
const gm = require('gm');
const mkdirp = require('mkdirp');
const path = require('path');
const ActiveRecord = require('areto/db/ActiveRecord');
const PromiseHelper = require('areto/helper/PromiseHelper');