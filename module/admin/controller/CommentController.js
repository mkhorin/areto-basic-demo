'use strict';

const Base = require('../component/CrudController');

module.exports = class CommentController extends Base {

    async actionIndex () {
        const provider = this.createDataProvider({
            query: this.spawn(Comment).findBySearch(this.getQueryParam('search')),
            pagination: {},
            sort: {
                attrs: {
                    [Comment.PK]: true,
                    status: true
                },
                defaultOrder: {[Comment.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider});
    }

    async actionCreate () {
        const article = await this.getModel({ModelClass: Article});
        const model = this.spawn(Comment);
        if (this.isGet()) {
            return this.render('create', {model});
        }
        model.load(this.getPostParams());
        model.set('articleId', article.getId());
        await model.save()
            ? this.backToRef()
            : await this.render('create', {model});
    }

    async actionView () {
        await super.actionView({with: 'article'});
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const Comment = require('../model/Comment');