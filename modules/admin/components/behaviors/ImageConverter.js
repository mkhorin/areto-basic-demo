'use strict';

const Base = require('./File');

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
        async.series([
            cb => mkdirp(path.dirname(destPath), cb),
            cb => {
                let image;
                try {
                    image = gm(this.fileModel.getPath());
                    image.resize(this.size, this.getThumbHeight(this.size));
                } catch (err) {
                    return cb(err);
                }
                image.write(destPath, cb);
            },
            cb => {
                this.owner.set(this.filenameAttr, filename);
                this.generateThumbs(cb);
            },
            cb => this.afterProcessFile
                ? this.afterProcessFile(this.fileModel, cb)
                : cb()
        ], cb);
    }
};

const async = require('async');
const path = require('path');
const gm = require('gm');
const mkdirp = require('mkdirp');