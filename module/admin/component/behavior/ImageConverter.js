'use strict';

const Base = require('./File');

module.exports = class ImageConverter extends Base {

    createFilename (file) {
        file = `${file.get('filename')}.${this.thumbExtension}`; 
        return path.join(this.generateNestedDir(), file);
    }

    getThumbName (size) {
        return `${size}/${this.getFilename()}`;
    }

    async processFile () {
        const filename = this.createFilename(this.fileModel);
        const destPath = path.join(this.storeDir, filename);
        await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
        await this.createThumbImage(destPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generateThumbs();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }
    
    createThumbImage (destPath) {
        const image = sharp(this.fileModel.getPath());
        image.resize(this.size, this.getThumbHeight(this.size), {fit: 'inside'});
        return image.toFile(destPath);
    }
};

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');