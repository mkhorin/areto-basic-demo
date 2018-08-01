'use strict';

const Base = require('../component/CrudController');

module.exports = class PhotoController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'assign-main': 'post'
            }
        };
    }

    actionIndex () {
        let provider = this.createDataProvider({            
            query: Photo.find().with(['article']),
            pagination: {
                pageSize: 10
            },
            sort: {
                attrs: {
                    [Photo.PK]: true,
                    title: true
                },
                defaultOrder: {
                    [Photo.PK]: -1
                }
            }
        });
        this.renderDataProvider(provider, 'index', {provider});
    }

    actionCreate () {
        let model = new Photo;
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
        let data;
        this.getModel(null, model => {
            async.waterfall([
                cb => async.series({
                    articles: cb => Article.findToSelect().all(cb)
                }, cb),
                (result, cb)=> {
                    data = result;
                    data.model = model;
                    if (this.isGet()) {
                        return this.render('update', data);
                    }
                    model.load(this.getBodyParams()).save(cb);
                },
                (model, cb)=> model.hasError()
                    ? this.render('update', data)
                    : this.backToRef()
            ], err =>  this.throwError(err));
        });
    }

    actionView () {
        super.actionView({
            with: ['article']
        });
    }

    actionUpload () {
        let file = new File, photo;
        async.series([
            cb => file.upload(this, cb),
            cb => file.hasError()
                ? this.sendText(this.translate(file.getFirstError()), 400)
                : cb(),
            cb => {
                photo = new Photo;
                photo.set('file', file.getId());
                photo.validate(cb, ['file']);
            },
            cb => photo.hasError()
                ? this.sendText(this.translate(photo.getFirstError()), 400)
                : this.sendText(file.getId())
        ], err => this.throwError(err));
    }

    actionAssignMain () {
        this.getModel({
            with: ['article']
        }, model => {
            let article = model.get('article');
            if (!article) {
                this.setFlash('danger', 'Article not found');
                return this.redirect(['view', model]);
            }
            article.set('mainPhotoId', model.getId());
            async.series([
                cb => article.forceSave(cb),
                cb => this.redirect(['article/view', article])
            ], err => this.throwError(err));
        });
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const Article = require('../model/Article');
const File = require('../model/File');
const Photo = require('../model/Photo');