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
                    value: key,
                    label: map[key]
                });
            }
        }
        return items;
    }

    // QUERY HANDLER

    static handleQueryCaptionNames (handler, cb) {
        handler((err, query)=> {
            err ? cb(err) : this.queryCaptionNames(query, cb);
        });
    }

    static handleQueryItems (handler, cb, data) {
        handler((err, query)=> {
            err ? cb(err) : this.queryItems(query, cb, data);
        });
    }

    // QUERY

    static queryCaptionNames (query, cb) {
        this.queryItems(query, cb, {
            getItemText: this.getCaptionNameText
        });
    }

    static queryItems (query, cb, data) {
        async.waterfall([
            cb => query.asRaw().all(cb),
            (docs, cb)=> cb(null, this.getItems(docs, data))
        ], cb);
    }

    // MODEL

    static getModelCaptionNames (models) {
        return this.getModelItems(models, {
            getItemText: this.getCaptionNameText
        });
    }

    static getModelItems (models, data) {
        models = models ? models.map(model => model._attrs) : [];
        return this.getItems(models, data);
    }

    // DOCS

    static getCaptionNames (docs) {
        return this.getItems(docs, {
            getItemText: this.getCaptionNameText
        });
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

    static getCaptionNameText (doc, data) {
        return doc.caption ? `${doc.name} - ${doc.caption}` : doc.name;
    }

    static getItemText (doc, data) {
        return doc[data.textKey] || doc[data.valueKey];
    }
};

const async = require('areto/helper/AsyncHelper');