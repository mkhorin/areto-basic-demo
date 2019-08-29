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
            // thumbs: [800, 400, 200],
            // if thumb max height does not match thumb max width
            // thumbHeights: { 128: 164, 200: 300 },
            // thumbResizeMethod: 'cropResizeImage',
            // watermark: { 800: path.join(__dirname, './common/data/watermark.png')}
            // afterProcessFile: async (fileModel)
            ...config
        });
        if (!this.defaultThumbSize && this.thumbs) {
            this.defaultThumbSize = this.thumbs[this.thumbs.length - 1];
        }
        this.setHandler(ActiveRecord.EVENT_BEFORE_VALIDATE, this.beforeValidate);
        this.setHandler(ActiveRecord.EVENT_AFTER_VALIDATE, this.afterValidate);
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
        const file = this.owner.get(this.fileAttr);
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

    async afterValidate () {
        if (!this.fileModel || this.owner.hasError()) {
            return true;
        }
        try {
            await this.checkFile();
            if (!this.owner.isNew()) {
                await this.removeFiles();
            }
            await this.processFile();
        } catch (err) {
            this.log('error', err);
            this.owner.addError(this.fileAttr, err);
        }
    }

    async afterRemove () {
        await this.removeFiles();
    }

    // PROCESS

    async checkFile () {
        if (!this.fileModel) {
            throw new Error(`File model is not set`);
        }
        const filePath = this.fileModel.getPath();
        const stat = await fs.promises.stat(filePath);
        if (!stat.isFile()) {
            throw new Error(`This is not file: ${filePath}`);
        }
    }

    async processFile () {
        const filename = this.createFilename(this.fileModel);
        const targetPath = path.join(this.storeDir, filename);
        await fs.promises.mkdir(path.dirname(targetPath), {recursive: true});
        await fs.promises.rename(this.fileModel.getPath(), targetPath);
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
        const now = new Date;
        return now.getFullYear() +'-'+ ('0' + (now.getMonth() + 1)).slice(-2);
    }

    async removeFiles () {
        for (const thumbPath of this.getThumbPaths()) {
            try {
                await fs.promises.unlink(thumbPath);
            } catch (err) {
                this.log('warn', `File remove failed: ${thumbPath}`, err);
            }
        }
    }

    // THUMBS

    getThumbPaths () {
        const paths = [this.getPath()];
        if (this.thumbs) {
            for (const thumb of this.thumbs)  {
                paths.push(this.getThumbPath(thumb));
            }
        }
        return paths;
    }

    async generateThumbs () {
        if (Array.isArray(this.thumbs) && this.fileModel.isImage()) {
            for (const width of this.thumbs) {
                await this.createThumb(width);
            }
        }
    }

    async createThumb (width) {
        let image = sharp(this.getPath());
        const height = this.getThumbHeight(width);
        image.resize(width, height, {fit: 'inside'});
        image = await this.setWatermark(image, width);
        const thumbPath = this.getThumbPath(width);
        await fs.promises.mkdir(path.dirname(thumbPath), {recursive: true});
        return image.jpeg({quality: this.quality}).toFile(thumbPath);
    }

    getThumbHeight (width) {
        return this.thumbHeights && this.thumbHeights[width]
            ? this.thumbHeights[width]
            : width;
    }

    async setWatermark (image, width) {
        if (!this.watermark || !this.watermark[width]) {
            return image;
        }
        const {data, info} = await image.raw().toBuffer({resolveWithObject: true});
        const overlay = await sharp(this.watermark[width]).metadata();
        image = sharp(data, {raw: info});
        if (info.width < overlay.width || info.height < overlay.height) {
            this.log('warn', `Watermark skipped: Overlay is larger than image: ${this.getFilename()}`);
            return image;
        }
        return image.composite([{
            gravity: 'northwest',
            input: this.watermark[width]
        }]);
    }
};

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ActiveRecord = require('areto/db/ActiveRecord');