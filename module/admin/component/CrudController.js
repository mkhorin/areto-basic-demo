'use strict';

const Base = require('./BaseController');

module.exports = class CrudController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                'csrf': {
                    Class: require('areto/filter/CsrfFilter'),
                    only: ['create', 'update', 'delete']
                },
            }
        };
    }

    async actionCreate () {
        const model = this.spawn(this.getModelClass());
        model.scenario = 'create';
        this.isPostRequest() && await model.load(this.getPostParams()).save()
            ? this.redirectToReferrer()
            : await this.render('create', {model});
    }
    
    async actionView (params) {
        const model = await this.getModel(params);
        await this.render('view', {model});
    }

    async actionUpdate (params) {
        const model = await this.getModel(params);
        model.scenario = 'update';
        this.isPostRequest() && await model.load(this.getPostParams()).save()
            ? this.redirectToReferrer()
            : await this.render('update', {model});
    }

    async actionDelete (params) {
        const model = await this.getModel(params);
        await model.delete();
        this.isAjax()
            ? this.send(model.getId())
            : this.redirectToReferrer();
    }
};
module.exports.init();