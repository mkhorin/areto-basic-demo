'use strict';

const Base = require('areto/base/Controller');

module.exports = class BaseController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'delete': 'post'
            }
        };
    }

    async getModel (params) {
        const ModelClass = this.getModelClass();
        const {id} = this.getQueryParams();
        params = {ModelClass, id, ...params};
        if (!MongoHelper.isValidId(params.id)) {
            throw new BadRequest;
        }
        let model = new params.ModelClass({module: this.module});
        model = await model.findById(params.id).with(params.with).one();
        if (!model) {
            throw new NotFound;
        }
        return model;
    }

    createDataProvider (config) {
        return this.spawn(ActiveDataProvider, {
            controller: this,
            ...config
        });
    }

    async renderDataProvider (provider, template, data) {
        await provider.prepare();
        await this.render(template, data);
    }

    getLabelSelectItems (attrName, model) {
        const data = model.constructor.getAttrValueLabels(attrName);
        return SelectHelper.getMapItems(this.translateMessageMap(data));
    }
};
module.exports.init();

const BadRequest = require('areto/error/http/BadRequest');
const NotFound = require('areto/error/http/NotFound');
const MongoHelper = require('areto/helper/MongoHelper');
const SelectHelper = require('./helper/SelectHelper');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');