'use strict';

const Base = require('../component/CrudController');

module.exports = class FileController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'upload': 'post'
            },
            actionCreate: null,
            actionUpdate: null
        };
    }

    async actionIndex () {
        const provider = this.createDataProvider({
            query: this.spawn(File).find(),
            pagination: {},
            sort: {
                attrs: {
                    [File.PK]: true,
                    originalName: true,
                    size: true
                },
                defaultOrder: {[File.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider});
    }

    async actionUpload () {
        const model = this.spawn(File);
        await model.upload(this.req, this.res, this.user)
            ? this.sendText(model.getId())
            : this.sendText(this.translate(model.getFirstError()), 400);
    }
};
module.exports.init(module);

const File = require('../model/File');