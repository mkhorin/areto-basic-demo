'use strict';

const Base = require('areto/base/Behavior');

module.exports = class File extends Base {

    constructor (config) {
        super({
            // FileClass: require('../model/File'),
            fileAttr: 'file', // owner attribute with uploaded file
            // filenameAttr: 'filename', // owner attribute with filename
            // directories can be public or private
            // storeDirectory: path.join(__dirname, '../upload/files'),
            // previewDirectory: path.join(__dirname, '../web/previews'),
            previewExtension: 'jpg',
            quality: 50,
            // previews: [800, 400, 200],
            // if preview max height does not match preview max width
            // previewHeights: { 128: 164, 200: 300 },
            // previewResizeMethod: 'cropResizeImage',
            // watermark: { 800: path.join(__dirname, './common/data/watermark.png')}
            // afterProcessFile: async (fileModel)
            ...config
        });
        if (!this.defaultPreviewSize && this.previews) {
            this.defaultPreviewSize = this.previews[this.previews.length - 1];
        }
        this.setHandler(ActiveRecord.EVENT_BEFORE_VALIDATE, this.beforeValidate);
        this.setHandler(ActiveRecord.EVENT_AFTER_VALIDATE, this.afterValidate);
        this.setHandler(ActiveRecord.EVENT_AFTER_REMOVE, this.afterRemove);
    }
  
    getPath () {
        return path.join(this.storeDirectory, this.getFilename());
    }

    getFilename () {
        return this.owner.get(this.filenameAttr) || '';
    }

    getPreviewPath (size) {
        return path.join(this.previewDirectory, this.getPreviewName(size));
    }

    getPreviewName (size) {
        return `${size}/${this.getFilename()}.${this.previewExtension}`;
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
        const targetPath = path.join(this.storeDirectory, filename);
        await fs.promises.mkdir(path.dirname(targetPath), {recursive: true});
        await fs.promises.rename(this.fileModel.getPath(), targetPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generatePreviews();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }

    createFilename (file) {
        return path.join(this.generateNestedDirectory(), file.get('filename'));
    }

    generateNestedDirectory () { // split by months
        const now = new Date;
        return now.getFullYear() +'-'+ ('0' + (now.getMonth() + 1)).slice(-2);
    }

    async removeFiles () {
        for (const previewPath of this.getPreviewPaths()) {
            try {
                await fs.promises.unlink(previewPath);
            } catch (err) {
                this.log('warn', `File remove failed: ${previewPath}`, err);
            }
        }
    }

    // PREVIEWS

    getPreviewPaths () {
        const paths = [this.getPath()];
        if (this.previews) {
            for (const preview of this.previews)  {
                paths.push(this.getPreviewPath(preview));
            }
        }
        return paths;
    }

    async generatePreviews () {
        if (Array.isArray(this.previews) && this.fileModel.isImage()) {
            for (const width of this.previews) {
                await this.createPreview(width);
            }
        }
    }

    async createPreview (width) {
        let image = sharp(this.getPath());
        const height = this.getPreviewHeight(width);
        image.resize(width, height, {fit: 'inside'});
        image = await this.setWatermark(image, width);
        const previewPath = this.getPreviewPath(width);
        await fs.promises.mkdir(path.dirname(previewPath), {recursive: true});
        return image.jpeg({quality: this.quality}).toFile(previewPath);
    }

    getPreviewHeight (width) {
        return this.previewHeights && this.previewHeights[width]
            ? this.previewHeights[width]
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