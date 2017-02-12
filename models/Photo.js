'use strict';

const Base = require('areto/db/ActiveRecord');
const path = require('path');

module.exports = class Photo extends Base {

    static getConstants () {
        return {
            TABLE: 'photo'
        };
    }

    getTitle () {
        return this.get('title');
    }

    getLarge () {
        return this.getThumb(720);
    }

    getMedium () {
        return this.getThumb(360);
    }

    getSmall () {
        return this.getThumb(128);
    }

    getThumb (size) {
        return `/photos/${size}/${this.get('filename')}`;
    }

};
module.exports.init(module);