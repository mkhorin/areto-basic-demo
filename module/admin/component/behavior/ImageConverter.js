'use strict';

const Base = require('./File');

module.exports = class ImageConverter extends Base {

    createFilename (file) {
        file = `${file.get('filename')}.${this.previewExtension}`;
        return path.join(this.generateNestedDirectory(), file);
    }

    getPreviewName (size) {
        return `${size}/${this.getFilename()}`;
    }

    async processFile () {
        const filename = this.createFilename(this.fileModel);
        const targetPath = path.join(this.storeDirectory, filename);
        await fs.promises.mkdir(path.dirname(targetPath), {recursive: true});
        await this.createPreviewImage(targetPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generatePreviews();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }
    
    createPreviewImage (targetPath) {
        const image = sharp(this.fileModel.getPath());
        image.resize(this.size, this.getPreviewHeight(this.size), {fit: 'inside'});
        return image.toFile(targetPath);
    }
};

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');