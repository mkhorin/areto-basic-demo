'use strict';

const Base = require('./BaseController');

module.exports = class CrudController extends Base {

    async actionCreate () {
        let model = new (this.getModelClass());
        model.scenario = 'create';
        this.isPost() && await model.load(this.getPostParams()).save()
            ? this.backToRef()
            : await this.render('create', {model});
    }
    
    async actionView (params) {
        let model = await this.getModel(params);
        await this.render('view', {model});
    }

    async actionUpdate (params) {
        let model = await this.getModel(params);
        model.scenario = 'update';
        this.isPost() && await model.load(this.getPostParams()).save()
            ? this.backToRef()
            : await this.render('update', {model});
    }

    async actionDelete (params) {
        let model = await this.getModel(params);
        await model.remove();
        this.isAjax()
            ? this.send(model.getId())
            : this.backToRef();
    }
};