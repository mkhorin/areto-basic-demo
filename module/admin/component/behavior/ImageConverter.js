'use strict';

const Base = require('./File');

module.exports = class ImageConverter extends Base {

    createFilename (file) {
        file = `${file.get('filename')}.${this.thumbnailExtension}`;
        return path.join(this.generateNestedDirectory(), file);
    }

    getThumbnailName (size) {
        return `${size}/${this.getFilename()}`;
    }

    async processFile () {
        const filename = this.createFilename(this.fileModel);
        const targetPath = path.join(this.storeDirectory, filename);
        await fs.promises.mkdir(path.dirname(targetPath), {recursive: true});
        await this.createThumbnailImage(targetPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generateThumbnails();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }

    createThumbnailImage (targetPath) {
        const image = sharp(this.fileModel.getPath());
        image.resize(this.size, this.getThumbnailHeight(this.size), {fit: 'inside'});
        return image.toFile(targetPath);
    }
};

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');