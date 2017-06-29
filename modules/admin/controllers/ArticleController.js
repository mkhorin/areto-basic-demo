'use strict';

const Base = require('../components/CrudController');

module.exports = class ArticleController extends Base {

    actionIndex () {
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
           err ? this.throwError(err) : this.render('index', {provider});
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
        }, ['author', 'photos', 'mainPhoto', 'tags']);
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
            this.user.can('updateArticle', (err, access)=>{
                if (err) {
                    return this.throwError(err);
                }
                if (!access) {
                    return this.throwForbidden();
                }
                if (this.isGet()) {
                    return this.render('update', {model});
                }
                model.load(this.getBodyParams()).save(err => {
                    if (err) {
                        this.throwError(err);
                    } else if (model.hasError()) {
                        this.render('update', {model});
                    } else {
                        this.backToRef();
                    }
                });
            }, {
                authorId: model.get('authorId')
            });
        }, 'photos', 'tags');
    }
};
module.exports.init(module);

const ActiveDataProvider = require('areto/data/ActiveDataProvider');