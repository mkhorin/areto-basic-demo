'use strict';

const DEFAULT_VALUE_KEY = '_id';
const DEFAULT_TEXT_KEY = 'name';

module.exports = class SelectHelper {

    // MAP

    static getMapItems (map) {
        const items = [];
        if (map) {
            for (let value of Object.keys(map)) {
                items.push({
                    value,
                    label: map[value]
                });
            }
        }
        return items;
    }

    // QUERY HANDLER

    static async handleQueryCaptionNames (handler) {
        return this.queryCaptionNames(await handler());
    }

    static async handleQueryItems (handler, data) {
        return this.queryItems(await handler(), data);
    }

    // QUERY

    static queryCaptionNames (query) {
        return this.queryItems(query, {getItemText: this.getCaptionText});
    }

    static async queryItems (query, data) {
        return this.getItems(await query.raw().all(), data);
    }

    // MODEL

    static getModelCaptionNames (models) {
        return this.getModelItems(models, {getItemText: this.getCaptionText});
    }

    static getModelItems (models, data) {
        models = models ? models.map(model => model.getAttrMap()) : [];
        return this.getItems(models, data);
    }

    // DOCS

    static getCaptionNames (docs) {
        return this.getItems(docs, {getItemText: this.getCaptionText});
    }

    static getItems (docs, data = {}) {
        if (!data.valueKey) {
            data.valueKey = DEFAULT_VALUE_KEY;
        }
        if (!data.textKey) {
            data.textKey = DEFAULT_TEXT_KEY;
        }
        if (!data.getItemText) {
            data.getItemText = this.getItemText;
        }
        const items = [];
        if (docs) {
            for (let doc of docs) {
                items.push({
                    value: doc[data.valueKey],
                    label: data.getItemText.call(this, doc, data)
                });
            }
        }
        return items;
    }

    static getCaptionText ({caption, name }) {
        return caption ? `${name} - ${caption}` : name;
    }

    static getItemText (doc, {textKey, valueKey}) {
        return doc[textKey] || doc[valueKey];
    }
};