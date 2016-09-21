'use strict';

let Base = require('areto/base/Controller');

module.exports = class BaseController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'delete': ['post']
            }
        };
    }

    static isValidId (id) {
        return id && /^[a-f0-9]{24}$/.test(id);
    }

    getModel (cb, ...relations) {
        let id = this.getQueryParam('id');
        if (this.constructor.isValidId(id)) {
            this.getModelClass().findById(id).with(relations).one((err, model)=> {
                err ? this.throwError(err)
                    : model ? cb(model) : this.throwNotFound();
            });
        } else this.throwNotFound();
    }
};
module.exports.init(module);