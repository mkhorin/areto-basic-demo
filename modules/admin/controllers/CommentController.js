'use strict';

const Base = require('../components/CrudController');

module.exports = class CommentController extends Base {

    actionIndex () {
        let provider = new ActiveDataProvider({
            controller: this,
            query: this.getModelClass().findBySearch(this.getQueryParam('search')),
            pagination: {},
            sort: {
                attrs: {
                    _id: true,
                    status: true
                },
                defaultOrder: {
                    _id: -1
                }
            }
        });
        provider.prepare(err => {
           err ? this.throwError(err)
               : this.render('index', {provider});
        });
    }

    actionCreate () {
        let id = this.getQueryParam('id');
        if (!this.constructor.isValidId(id)) {
            return this.throwBadRequest('Invalid article param in the query string');
        }
        Article.findById(id).one((err, article)=> {
            if (err) {
                return this.throwError(err);
            }
            if (!article) {
                return this.throwNotFound();
            }
            let model = new (this.getModelClass());
            if (this.isGet()) {
                return this.render('create', {model});
            }
            model.load(this.getBodyParams());
            model.set('articleId', article.getId());
            model.save(err => {
                err ? this.throwError(err)
                    : model.isNew()
                        ? this.render('create', {model})
                        : this.backToRef();
            });
        });
    }

    actionView () {
        super.actionView('article');
    }
};
module.exports.init(module);

const ActiveDataProvider = require('areto/data/ActiveDataProvider');
const Article = require('../models/Article');
