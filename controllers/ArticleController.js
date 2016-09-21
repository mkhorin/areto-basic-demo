'use strict';

let Base = require('../components/Controller');

module.exports = class ArticleController extends Base {

    getModelClass () {
        return require('../models/Article');
    }

    actionIndex () {
        let provider = new ActiveDataProvider({
            controller: this,
            query: this.getModelClass().findPublished(),
            sort: {
                attributes: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: 'DESC'}
            }
        });
        provider.prepare(err => {
            err ? this.throwError(err) : this.render('index', {provider});
        });
    }

    actionTagged () {
        let tagName = this.getQueryParam('tag');
        let tag = new Tag;
        tag.set('name', tagName);
        tag.validate(err => {
            if (err) {
                return this.throwError(err);
            }
            if (tag.hasError()) {
                return this.render('tagged', {tagName});
            }
            Tag.find({name: tagName}).one((err, tag)=> {
                if (err) {
                    return this.throwError(err);
                }
                if (!tag) {
                    return this.render('tagged', {tagName});
                }
                let provider = new ActiveDataProvider({
                    controller: this,
                    query: tag.relArticles(),
                    sort: {
                        attributes: {
                            date: true,
                            title: true
                        },
                        defaultOrder: {date: 'DESC'}
                    }
                });
                provider.prepare(err => {
                    err ? this.throwError(err) : this.render('tagged', {provider, tagName});
                });
            });
        });
    }

    actionSearch () {
        let provider = new ActiveDataProvider({
            controller: this,
            query: this.getModelClass().findBySearch(this.getQueryParam('text')),
            sort: {
                attributes: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: 'DESC'}
            }
        });
        provider.prepare(err => {
            err ? this.throwError(err) : this.render('index', {provider});
        });
    }

    actionView () {
        this.getModel(model => {
            let comment = new (require('../models/Comment'));
            if (this.isPost()) {
                comment.load(this.getBodyParams());
                comment.set('articleId', model.getId());
                comment.set('ip', this.req.ip);
                comment.save(err => {
                    if (err) {
                        return this.throwError(err);
                    }
                    if (comment.hasError()) {                        
                        this.view(model, comment);
                    } else {
                        this.setFlash('comment-done', 'You message has been sent successfully!');
                        this.redirect(['view', model]);
                    }
                });
            } else {
                this.view(model, comment);
            }
        }, 'mainPhoto', 'photos', 'tags');
    }

    view (model, comment) {
        let comments = new ActiveDataProvider({
            controller: this,
            query: model.relComments()
        });
        comments.prepare(err => {
            err ? this.throwError(err)
                : this.render('view', {model, comments, comment});
        });
    }

};
module.exports.init(module);

let ActiveDataProvider = require('areto/data/ActiveDataProvider');
let Tag = require('../models/Tag');