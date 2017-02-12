'use strict';

let Base = require('../components/CrudController');
let async = require('async');

module.exports = class PhotoController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'assign-main': ['post']
            }
        };
    }

    getModelClass () {
        return require('../models/Photo');
    }

    actionIndex () {
        let ActiveDataProvider = require('areto/data/ActiveDataProvider');
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.find().with(['article']), //BySearch(this.getQueryParam('search')),
            pagination: {},
            sort: {
                attrs: {
                    [Class.PK]: true,
                    title: true
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

    actionCreate () {
        let model = new (this.getModelClass());
        model.scenario = 'create';
        let params = {model};
        async.series([
            cb => Article.findToSelect().all(cb)
        ], (err, result)=> {
            if (err) {
                return cb(err);
            }
            params.articles = result[0];
            if (this.isPost()) {
                model.load(this.getBodyParams()).save(err => {
                    err ? this.throwError(err)
                        : model.isNewRecord() ? this.render('create', params) :  this.backToRef();
                });
            } else this.render('create', params);
        });
    }
    
    actionUpdate () {
        this.getModel(model => {
            let params = {model};
            async.series([
                cb => Article.findToSelect().all(cb)
            ], (err, result)=> {
                if (err) {
                    return cb(err);
                }
                params.articles = result[0];
                if (this.isPost()) {
                    model.load(this.getBodyParams()).save(err => {
                        err ? this.throwError(err)
                            : model.hasError() ? this.render('update', params) : this.backToRef();
                    });
                } else this.render('update', params);
            });
        });
    }

    actionView () {
        super.actionView('article');
    }

    actionUpload () {
        let File = require('../models/File');
        let file = new File;
        file.upload(this, err => {
            if (err) {
                this.throwError(err);
            } else if (file.hasError()) {
                this.sendText(this.translate(file.getFirstError()), 400);
            } else {
                let photo = new (this.getModelClass());
                photo.set('file', file.getId());
                photo.validate(err => {
                    if (err) {
                        this.throwError(err);
                    } else if (photo.hasError()) {
                        this.sendText(this.translate(photo.getFirstError()), 400);
                    } else {
                        this.sendText(file.getId());
                    }
                }, ['file']);
            }            
        });
    }

    actionAssignMain () {
        this.getModel(model => {
            let article = model.get('article');
            if (article) {
                article.set('mainPhotoId', model.getId());
                article.forceSave(err => {
                    err ? this.throwError(err) : this.redirect(['article/view', article]);
                });
            } else {
                this.setFlash('danger', 'Article not found');
                this.redirect(['view', model]);
            }
        }, 'article');
    }
};
module.exports.init(module);

let Article = require('../models/Article');