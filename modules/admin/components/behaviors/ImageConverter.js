'use strict';

let Base = require('./File');
let path = require('path');
let gm = require('gm');
let mkdirp = require('mkdirp');

module.exports = class ImageConverter extends Base {

    createFilename (file) {
        return path.join(this.generateNestedDir(), `${file.get('filename')}.${this.thumbExtension}`);
    }

    getThumbName (size) {
        return `${size}/${this.getFilename()}`;
    }

    processFile (cb) {
        let filename = this.createFilename(this.fileModel);
        let destPath = path.join(this.storeDir, filename);
        mkdirp(path.dirname(destPath), err => {
            if (err) {
                return cb(err);
            }
            try {
                let image = gm(this.fileModel.getPath());
                image.resize(this.size, this.getThumbHeight(this.size));
                image.write(destPath, err => {
                    if (err) {
                        return cb(err);
                    }                    
                    this.owner.set(this.filenameAttr, filename);
                    this.generateThumbs(err => {
                        err ? cb(err) : this.afterProcessFile ? this.afterProcessFile(this.fileModel, cb) : cb();
                    });
                });
            } catch (err) {
                cb(err);
            }
        });
    }
};