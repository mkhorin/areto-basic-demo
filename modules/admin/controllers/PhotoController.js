'use strict';

const Base = require('../components/CrudController');

module.exports = class PhotoController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'assign-main': 'post'
            }
        };
    }

    actionIndex () {
        let ActiveDataProvider = require('areto/data/ActiveDataProvider');
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.find().with(['article']), //BySearch(this.getQueryParam('search')),
            pagination: {
                pageSize: 10
            },
            sort: {
                attrs: {
                    [Class.PK]: true,
                    title: true
                },
                defaultOrder: {
                    [Class.PK]: -1
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err)
               : this.render('index', {provider});
        });
    }

    actionCreate () {
        let model = new (this.getModelClass());
        model.scenario = 'create';
        async.series({
            articles: cb => Article.findToSelect().all(cb)
        }, (err, params)=> {
            if (err) {
                return this.throwError(err);
            }
            params.model = model;
            if (this.isGet()) {
                return this.render('create', params);
            }
            model.load(this.getBodyParams()).save(err => {
                err ? this.throwError(err)
                    : model.isNew()
                        ? this.render('create', params)
                        : this.backToRef();
            });
        });
    }
    
    actionUpdate () {
        this.getModel(model => {
            async.series({
                articles: cb => Article.findToSelect().all(cb)
            }, (err, params)=> {
                if (err) {
                    return this.throwError(err);
                }
                params.model = model;
                if (this.isGet()) {
                    return this.render('update', params);
                }
                model.load(this.getBodyParams()).save(err => {
                    err ? this.throwError(err)
                        : model.hasError()
                            ? this.render('update', params)
                            : this.backToRef();
                });
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
                return this.throwError(err);
            }
            if (file.hasError()) {
                return this.sendText(this.translate(file.getFirstError()), 400);
            }
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
        });
    }

    actionAssignMain () {
        this.getModel(model => {
            let article = model.get('article');
            if (!article) {
                this.setFlash('danger', 'Article not found');
                return this.redirect(['view', model]);
            }
            article.set('mainPhotoId', model.getId());
            article.forceSave(err => {
                err ? this.throwError(err)
                    : this.redirect(['article/view', article]);
            });
        }, 'article');
    }
};
module.exports.init(module);

const async = require('async');
const Article = require('../models/Article');