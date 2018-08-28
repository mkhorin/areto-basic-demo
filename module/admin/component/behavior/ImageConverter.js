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
        let filename = this.createFilename(this.fileModel);
        let destPath = path.join(this.storeDir, filename);
        mkdirp.sync(path.dirname(destPath));
        await this.createThumbImage(destPath);
        this.owner.set(this.filenameAttr, filename);
        await this.generateThumbs();
        if (this.afterProcessFile) {
            await this.afterProcessFile(this.fileModel);
        }
    }
    
    createThumbImage (destPath) {
        let image = gm(this.fileModel.getPath());
        image.resize(this.size, this.getThumbHeight(this.size));
        return PromiseHelper.promise(image.write.bind(image, destPath));
    }
};

const path = require('path');
const gm = require('gm');
const mkdirp = require('mkdirp');
const PromiseHelper = require('areto/helper/PromiseHelper');