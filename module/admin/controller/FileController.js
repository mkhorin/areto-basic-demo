'use strict';

const Base = require('../component/CrudController');

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

    actionIndex () {
        let provider = this.createDataProvider({
            query: File.find(),
            pagination: {},
            sort: {
                attrs: {
                    [File.PK]: true,
                    originalName: true,
                    size: true
                },
                defaultOrder: {
                    [File.PK]: -1
                }
            }
        });
        this.renderDataProvider(provider, 'index', {provider});
    }

    actionUpload () {
        let model = new File;
        async.series([
            cb => model.upload(this, cb),
            cb => model.hasError()
                ? this.sendText(this.translate(model.getFirstError()), 400)
                : this.sendText(model.getId())
        ], err => this.throwError(err));
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const File = require('../model/File');