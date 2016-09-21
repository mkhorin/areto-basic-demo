'use strict';

let Base = require('../components/CrudController');

module.exports = class FileController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'upload': ['post']
            },
            actionCreate: null,
            actionUpdate: null
        };
    }

    getModelClass () {
        return require('../models/File');
    }

    actionIndex () {
        let ActiveDataProvider = require('areto/data/ActiveDataProvider');
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.find(),
            pagination: {},
            sort: {
                attributes: {
                    [Class.PK]: true,
                    originalName: true,
                    size: true
                },
                defaultOrder: {
                    [Class.PK]: 'DESC'
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {provider});
        });
    }

    actionUpload () {
        let model = new (this.getModelClass());
        model.upload(this, err => {
            if (err) {
                this.throwError(err);
            } else if (model.hasError()) {
                this.sendText(this.translate(model.getFirstError()), 400);
            } else {
                this.sendText(model.getId());
            }
        });
    }
};
module.exports.init(module);