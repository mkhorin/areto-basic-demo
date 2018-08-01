'use strict';

const Base = require('areto/base/Controller');

module.exports = class BaseController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'delete': ['post']
            }
        };
    }

    getModel (params, cb) {
        params = params = Object.assign({
            'ModelClass': this.getModelClass(),
            'id': this.getQueryParam('id')
        }, params);
        if (!MongoHelper.isValidId(params.id)) {
            return this.throwNotFound();
        }
        let query = params.ModelClass.findById(params.id).with(params.with);
        async.waterfall([
            cb => query.one(cb),
            model => model ? cb(model) : this.throwNotFound()
        ], err => this.throwError(err));
    }

    createDataProvider (config) {
        return new ActiveDataProvider(Object.assign({
            controller: this
        }, config));
    }

    renderDataProvider (provider, template, data) {
        async.series([
            cb => provider.prepare(cb),
            cb => this.render(template, data)
        ], err => this.throwError(err));
    }

    getLabelSelectItems (attrName, model) {
        let data = model.constructor.getAttrValueLabels(attrName);
        return SelectHelper.getMapItems(this.translateMessageMap(data));
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const MongoHelper = require('areto/helper/MongoHelper');
const SelectHelper = require('./helper/SelectHelper');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');