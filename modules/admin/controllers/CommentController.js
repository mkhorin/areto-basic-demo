'use strict';

let Base = require('../components/CrudController');

module.exports = class CommentController extends Base {

    getModelClass () {
        return require('../models/Comment');
    }

    actionIndex () {
        let ActiveDataProvider = require('areto/data/ActiveDataProvider');        
        let provider = new ActiveDataProvider({
            controller: this,
            query: this.getModelClass().findBySearch(this.getQueryParam('search')),
            pagination: {},
            sort: {
                attributes: {
                    _id: true,
                    status: true
                },
                defaultOrder: {
                    _id: 'DESC'
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err) : this.render('index', {provider});
        });
    }

    actionCreate () {
        let id = this.getQueryParam('id');
        if (this.constructor.isValidId(id)) {
            Article.findById(id).one((err, article)=> {
                if (err) {
                    return this.throwError(err);
                } else if (!article) {
                    return this.throwNotFound();
                }
                let model = new (this.getModelClass());
                if (this.isPost()) {
                    model.load(this.getBodyParams());
                    model.set('articleId', article.getId());
                    model.save(err => {
                        err ? this.throwError(err)
                            : model.isNewRecord ? this.render('create', {model}) : this.backToRef();
                    });
                } else this.render('create', {model});
            });
        } else {
            this.throwBadRequest('Invalid article param in the query string');
        }
    }

    actionView () {
        super.actionView('article');
    }
};
module.exports.init(module);

let Article = require('../models/Article');