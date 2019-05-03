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
        this.setHandler(ActiveRecord.EVENT_BEFORE_VALIDATE, this.beforeValidate);
        this.setHandler(ActiveRecord.EVENT_BEFORE_INSERT, this.beforeInsert);
        this.setHandler(ActiveRecord.EVENT_BEFORE_UPDATE, this.beforeUpdate);
        this.setHandler(ActiveRecord.EVENT_AFTER_REMOVE, this.afterRemove);
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
            this.fileModel = await this.spawn(this.FileClass).findById(file).one();
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
        fs.mkdirSync(path.dirname(destPath), {'recursive': true});
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
        if (Array.isArray(this.neededThumbs) && this.fileModel.isImage()) {
            for (let width of this.neededThumbs) {
                await this.createThumb(width);
            }
        }
    }

    createThumb (width) {
        let image = sharp(this.getPath());
        let height = this.getThumbHeight(width);
        image.resize(width, height, {'fit': 'inside'});
        this.setWatermark(image, width);
        let thumbPath = this.getThumbPath(width);
        fs.mkdirSync(path.dirname(thumbPath), {'recursive': true});
        return image.jpeg({'quality': this.quality}).toFile(thumbPath);
    }

    getThumbHeight (width) {
        return this.thumbHeights && this.thumbHeights[width]
            ? this.thumbHeights[width]
            : width;
    }

    setWatermark (image, width) {
        if (this.watermark && this.watermark[width]) {
            image.composite([{
                'input': this.watermark[width],
                'gravity': 'northwest'
            }]);
        }
    }
};

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ActiveRecord = require('areto/db/ActiveRecord');