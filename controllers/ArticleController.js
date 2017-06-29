'use strict';

const Base = require('../components/Controller');

module.exports = class ArticleController extends Base {

    actionIndex () {
        let provider = new ActiveDataProvider({
            controller: this,
            query: this.getModelClass().findPublished(),
            sort: {
                attrs: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: -1}
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
                        attrs: {
                            date: true,
                            title: true
                        },
                        defaultOrder: {date: -1}
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
                attrs: {
                    date: true,
                    title: true
                },
                defaultOrder: {date: -1}
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

const ActiveDataProvider = require('areto/data/ActiveDataProvider');
const Tag = require('../models/Tag');