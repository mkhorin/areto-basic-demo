'use strict';

const Base = require('areto/base/Behavior');

module.exports = class File extends Base {

    /**
     * @param {Object} config
     * @param {class} config.FileClass - File model class
     * @param {string} config.fileAttr - Owner attribute with uploaded file
     * @param {string} config.filenameAttr - Owner attribute with filename
     * @param {string} config.storeDirectory - path.join(__dirname, '../upload/files')
     * @param {string} config.thumbnailDirectory - path.join(__dirname, '../web/thumbnails')
     * @param {number} config.quality - JPEG converting quality
     * @param {number[]} config.thumbnails - Thumbnail widths: [800, 400, 200]
     * @param {Object} config.thumbnailHeights - Thumbnail max heights if necessary: {[width]: height}
     * @param {string} config.thumbnailResizeMethod
     * @param {Object} config.watermark - {[width]: path.join(__dirname, './common/data/watermark.png')}
     * @param {function} config.afterProcessFile - (fileModel) => ...
     */
    constructor (config) {
        super({
            fileAttr: 'file',
            thumbnailExtension: 'jpg',
            quality: 50,
            ...config
        });
        if (!this.defaultThumbnailSize && this.thumbnails) {
            this.defaultThumbnailSize = this.thumbnails[this.thumbnails.length - 1];
        }
        this.setHandler(ActiveRecord.EVENT_BEFORE_VALIDATE, this.beforeValidate);
        this.setHandler(ActiveRecord.EVENT_AFTER_VALIDATE, this.afterValidate);
        this.setHandler(ActiveRecord.EVENT_AFTER_DELETE, this.afterDelete);
    }
  
    getPath () {
        return path.join(this.storeDirectory, this.getFilename());
    }

    getFilename () {
        return this.owner.get(this.filenameAttr) || '';
    }

    getThumbnailPath (size) {
        return path.join(this.thumbnailDirectory, this.getThumbnailName(size));
    }

    getThumbnailName (size) {
        return `${size}/${this.getFilename()}.${this.thumbnailExtension}`;
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
                await this.deleteFiles();
            }
            await this.processFile();
        } catch (err) {
            this.log('error', err);
            this.owner.addError(this.fileAttr, err);
        }
    }

    async afterDelete () {
        await this.deleteFiles();
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
        await this.generateThumbnails();
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

    async deleteFiles () {
        for (const thumbnailPath of this.getThumbnailPaths()) {
            try {
                await fs.promises.unlink(thumbnailPath);
            } catch (err) {
                this.log('warn', `File deletion failed: ${thumbnailPath}`, err);
            }
        }
    }

    // THUMBNAILS

    getThumbnailPaths () {
        const paths = [this.getPath()];
        if (Array.isArray(this.thumbnails)) {
            for (const thumbnail of this.thumbnails)  {
                paths.push(this.getThumbnailPath(thumbnail));
            }
        }
        return paths;
    }

    async generateThumbnails () {
        if (Array.isArray(this.thumbnails) && this.fileModel.isImage()) {
            for (const width of this.thumbnails) {
                await this.createThumbnail(width);
            }
        }
    }

    async createThumbnail (width) {
        let image = sharp(this.getPath());
        const height = this.getThumbnailHeight(width);
        image.resize(width, height, {fit: 'inside'});
        image = await this.setWatermark(image, width);
        const thumbnailPath = this.getThumbnailPath(width);
        await fs.promises.mkdir(path.dirname(thumbnailPath), {recursive: true});
        return image.jpeg({quality: this.quality}).toFile(thumbnailPath);
    }

    getThumbnailHeight (width) {
        return this.thumbnailHeights?.[width] || width;
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