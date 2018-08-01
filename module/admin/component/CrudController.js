'use strict';

const Base = require('./BaseController');

module.exports = class CrudController extends Base {

    actionCreate () {
        let model = new (this.getModelClass());
        model.scenario = 'create';
        if (this.isGet()) {
            return this.render('create', {model});
        }
        async.series([
            cb => model.load(this.getBodyParams()).save(cb),
            cb => model.hasError()
                ? this.render('create', {model})
                : this.backToRef()
        ], err => this.throwError(err));
    }
    
    actionView (params) {
        this.getModel(params, model => {
            this.render('view', {model});
        });
    }

    actionUpdate (params) {
        this.getModel(params, model => {
            model.scenario = 'update';
            if (this.isGet()) {
                return this.render('update', {model});
            }
            async.series([
                cb => model.load(this.getBodyParams()).save(cb),
                cb => model.hasError()
                    ? this.render('update', {model})
                    : this.backToRef()
            ], err => this.throwError(err));
        });
    }

    actionDelete (params) {
        this.getModel(params, model => {
            async.series([
                cb => model.remove(cb),
                cb => this.isAjax()
                    ? this.send(model.getId())
                    : this.backToRef()
            ], err => this.throwError(err));
        });
    }
};

const async = require('areto/helper/AsyncHelper');