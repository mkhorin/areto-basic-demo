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

    getModel (params) {
        params = Object.assign({
            'ModelClass': this.getModelClass(),
            'id': this.getQueryParam('id')
        }, params);
        if (MongoHelper.isValidId(params.id)) {
            return params.ModelClass.findById(params.id).with(params.with).one();
        }
        throw new NotFoundHttpException;
    }

    createDataProvider (config) {
        return new ActiveDataProvider(Object.assign({
            controller: this
        }, config));
    }

    async renderDataProvider (provider, template, data) {
        await provider.prepare();
        await this.render(template, data);
    }

    getLabelSelectItems (attrName, model) {
        let data = model.constructor.getAttrValueLabels(attrName);
        return SelectHelper.getMapItems(this.translateMessageMap(data));
    }
};
module.exports.init(module);

const NotFoundHttpException = require('areto/error/NotFoundHttpException');
const MongoHelper = require('areto/helper/MongoHelper');
const SelectHelper = require('./helper/SelectHelper');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');