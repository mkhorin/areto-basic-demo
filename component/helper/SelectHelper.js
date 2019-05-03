'use strict';

const DEFAULT_VALUE_KEY = '_id';
const DEFAULT_TEXT_KEY = 'name';

module.exports = class SelectHelper {

    // MAP

    static getMapItems (map) {
        let items = [];
        if (map) {
            for (let key of Object.keys(map)) {
                items.push({
                    'value': key,
                    'label': map[key]
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
        return this.queryItems(query, {'getItemText': this.getCaptionText});
    }

    static async queryItems (query, data) {
        return this.getItems(await query.asRaw().all(), data);
    }

    // MODEL

    static getModelCaptionNames (models) {
        return this.getModelItems(models, {'getItemText': this.getCaptionText});
    }

    static getModelItems (models, data) {
        models = models ? models.map(model => model._attrs) : [];
        return this.getItems(models, data);
    }

    // DOCS

    static getCaptionNames (docs) {
        return this.getItems(docs, {'getItemText': this.getCaptionText});
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
        let items = [];
        if (docs) {
            for (let doc of docs) {
                items.push({
                    'value': doc[data.valueKey],
                    'label': data.getItemText.call(this, doc, data)
                });
            }
        }
        return items;
    }

    static getCaptionText (doc, data) {
        return doc.caption ? `${doc.name} - ${doc.caption}` : doc.name;
    }

    static getItemText (doc, data) {
        return doc[data.textKey] || doc[data.valueKey];
    }
};