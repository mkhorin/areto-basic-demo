'use strict';

const Base = require('../components/CrudController');

module.exports = class ArticleController extends Base {

    actionIndex () {
        let searchText = this.getQueryParam('search');
        let Class = this.getModelClass();
        let provider = new ActiveDataProvider({
            controller: this,
            query: Class.findBySearch(this.getQueryParam('search')).with('author', 'mainPhoto'),
            pagination: {
                pageSize: 10
            },
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
           err ? this.throwError(err)
               : this.render('index', {provider, searchText});
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
        if (this.isGet()) {
            return this.renderForm('create', {model});
        }
        model.load(this.getBodyParams());
        model.set('authorId', this.user.getId());
        model.save(err => {
            if (err) {
                this.throwError(err);
            } else if (model.hasError()) {
                this.renderForm('create', {model});
            } else {
                this.backToRef();
            }
        });
    }

    actionUpdate () {
        this.getModel(model => {
            async.waterfall([
                cb => {
                    this.user.can('updateArticle', cb,  {
                        authorId: model.get('authorId')
                    });
                },
                (access, cb)=> {
                    access ? cb() : this.throwForbidden();
                },
                cb => {
                    this.isGet()
                        ? this.renderForm('update', {model})
                        : model.load(this.getBodyParams()).save(cb);
                }
            ], err => {
                if (err) {
                    this.throwError(err);
                } else if (model.hasError()) {
                    this.renderForm('update', {model})
                } else {
                    this.backToRef();
                }
            });
        }, 'photos', 'tags');
    }

    renderForm (template, params) {
        async.series({
            categories: cb => Category.find().select({name: 1}).order({name:1}).asRaw().all(cb)
        }, (err, data)=> {
            err ? this.throwError(err)
                : this.render(template, Object.assign(data, params));
        });
    }
};
module.exports.init(module);

const async = require('async');
const ActiveDataProvider = require('areto/data/ActiveDataProvider');
const Category = require('../models/Category');