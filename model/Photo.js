'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class Photo extends Base {

    static getConstants () {
        return {
            TABLE: 'photo',
            SIZE_LARGE: 720,
            SIZE_MEDIUM: 360,
            SIZE_SMALL: 128
        };
    }

    getTitle () {
        return this.get('title') || '';
    }

    getLarge () {
        return this.getThumb(this.SIZE_LARGE);
    }

    getMedium () {
        return this.getThumb(this.SIZE_MEDIUM);
    }

    getSmall () {
        return this.getThumb(this.SIZE_SMALL);
    }

    getThumb (size) {
        return `photo/${size}/${this.get('filename')}`;
    }
};
module.exports.init(module);