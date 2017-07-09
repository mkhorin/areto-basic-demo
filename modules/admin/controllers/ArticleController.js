'use strict';

const Base = require('../components/CrudController');

module.exports = class ArticleController extends Base {

    actionIndex () {
        let searchText = this.getQueryParam('search');
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.findBySearch(this.getQueryParam('search')).with('author', 'mainPhoto'),
            pagination: {},
            sort: {
                attrs: {
                    [Class.PK]: true,
                    status: true,
                    title: true
                },
                defaultOrder: {
                    [Class.PK]: -1
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {provider, searchText});
        });
    }

    actionView () {
        this.getModel(model => {
            let comments = new ActiveDataProvider({
                controller: this,
                query: model.relComments(),
                sort: {
                    attrs: {
                        [model.PK]: true
                    },
                    defaultOrder: {
                        [model.PK]: -1
                    }
                }
            });
            comments.prepare(err => {
                err ? this.throwError(err)
                    : this.render('view', {model, comments});
            });
        }, ['author', 'category', 'photos', 'mainPhoto', 'tags']);
    }

    actionCreate () {        
        let model = new (this.getModelClass());
        if (this.isPost()) {
            model.load(this.getBodyParams());
            model.set('authorId', this.user.getId());
            model.save(err => {
                if (err) {
                    this.throwError(err);
                } else if (model.isNewRecord()) {
                    this.render('create', {model});
                } else {
                    this.backToRef();
                }
            });            
        } else {
            this.render('create', {model});
        }
    }

    actionUpdate () {
        this.getModel(model => {
            let renderData = {model};
            async.waterfall([
                cb => {
                    this.user.can('updateArticle', cb,  {
                        authorId: model.get('authorId')
                    });
                },
                (access, cb)=> {
                    access ? cb() : this.throwForbidden();
                },
                cb => this.prepareFormData(cb),
                (data, cb)=> {
                    Object.assign(renderData, data);
                    this.isGet() ? this.render('update', renderData)
                        : model.load(this.getBodyParams()).save(cb);
                }
            ], err => {
                if (err) {
                    this.throwError(err);
                } else if (model.hasError()) {
                    this.render('update', renderData);
                } else {
                    this.backToRef();
                }
            });
        }, 'photos', 'tags');
    }

    prepareFormData (cb) {
        async.series({
            categories: cb => Category.find().select({name: 1}).orderBy({name:1}).asArray().all(cb)
        }, cb);
    }
};
module.exports.init(module);

const async = require('async');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');
const Category = require('../models/Category');