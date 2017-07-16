'use strict';

const Base = require('./Controller');

module.exports = class CrudController extends Base {

    actionCreate () {
        let model = new (this.getModelClass());
        model.scenario = 'create';
        if (this.isPost()) {
            model.load(this.getBodyParams()).save(err => {
                if (err) {
                    this.throwError(err);
                } else if (model.isNew()) {
                    this.render('create', {model});
                } else {
                    this.backToRef();
                }
            });
        } else this.render('create', {model});
    }
    
    actionView (...relations) {
        this.getModel(model => {
            this.render('view', {model});
        }, relations);
    }

    actionUpdate (...relations) {
        this.getModel(model => {
            model.scenario = 'update';
            if (this.isPost()) {
                model.load(this.getBodyParams()).save(err => {
                    if (err) {
                        this.throwError(err);
                    } else if (model.hasError()) {
                        this.render('update', {model});
                    } else {
                        this.backToRef();
                    }
                });
            } else this.render('update', {model});
        }, relations);
    }

    actionDelete () {
        this.getModel(model => {
            model.remove(err => {
                if (err) {
                    this.throwError();
                } else if (this.isAjax()) {
                    this.send(model.getId());  
                } else {
                    this.backToRef();
                }
            });
        });
    }
};

