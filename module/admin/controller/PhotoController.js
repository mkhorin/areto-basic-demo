'use strict';

const Base = require('../component/CrudController');

module.exports = class PhotoController extends Base {

    static getConstants () {
        return {
            METHODS: {
                'assignMain': 'post'
            }
        };
    }

    actionIndex () {
        const provider = this.createDataProvider({            
            query: this.spawn(Photo).find().with('article'),
            pagination: {pageSize: 10},
            sort: {
                attrs: {
                    [Photo.PK]: true,
                    title: true
                },
                defaultOrder: {[Photo.PK]: -1}
            }
        });
        return this.renderDataProvider(provider, 'index', {provider});
    }

    async actionCreate () {
        const model = this.spawn(Photo, {scenario: 'create'});
        if (this.isPostRequest() && await model.load(this.getPostParams()).save()) {
            return this.redirectToReferrer();
        }
        const articles = await this.spawn(Article).findToSelect().all();
        await this.render('create', {model, articles});
    }
    
    async actionUpdate () {
        const model = await this.getModel();
        if (this.isPostRequest() && await model.load(this.getPostParams()).save()) {
            return this.redirectToReferrer();
        }
        const articles = await this.spawn(Article).findToSelect().all();
        await this.render('update', {model, articles});
    }

    async actionView () {
        await super.actionView({with: ['article']});
    }

    async actionUpload () {
        const file = this.spawn(File);
        if (!await file.upload(this.req, this.res, this.user)) {
            return this.sendText(this.translate(file.getFirstError()), 400);
        }
        const photo = this.spawn(Photo);
        photo.set('file', file.getId());
        await photo.validate(['file'])
            ? this.sendText(file.getId())
            : this.sendText(this.translate(photo.getFirstError()), 400);
    }

    async actionLead () {
        const model = await this.getModel({with: ['article']});
        const article = model.get('article');
        if (!article) {
            this.setFlash('danger', 'Article not found');
            return this.redirect(['view', model]);
        }
        article.set('mainPhotoId', model.getId());
        await article.forceSave();
        this.redirect(['article/view', article]);
    }
};
module.exports.init(module);

const Article = require('../model/Article');
const File = require('../model/File');
const Photo = require('../model/Photo');