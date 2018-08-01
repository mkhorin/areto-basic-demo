'use strict';

const Base = require('../component/CrudController');

module.exports = class CommentController extends Base {

    actionIndex () {
        let provider = this.createDataProvider({
            query: Comment.findBySearch(this.getQueryParam('search')),
            pagination: {},
            sort: {
                attrs: {
                    [Comment.PK]: true,
                    status: true
                },
                defaultOrder: {
                    [Comment.PK]: -1
                }
            }
        });
        this.renderDataProvider(provider, 'index', {provider});
    }

    actionCreate () {
        this.getModel({
            ModelClass: Article
        }, article => {
            let model = new Comment;
            if (this.isGet()) {
                return this.render('create', {model});
            }
            model.load(this.getBodyParams());
            model.set('articleId', article.getId());
            async.series([
                cb =>  model.save(cb),
                cb =>  model.hasError()
                    ? this.render('create', {model})
                    : this.backToRef()
            ], err => this.throwError(err));
        });
    }

    actionView () {
        super.actionView({
            with: 'article'
        });
    }
};
module.exports.init(module);

const async = require('areto/helper/AsyncHelper');
const Article = require('../model/Article');
const Comment = require('../model/Comment');