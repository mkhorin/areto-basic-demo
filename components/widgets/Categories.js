'use strict';

const Base = require('areto/base/Widget');

module.exports = class Categories extends Base {

    run (cb) {
        async.waterfall([
            cb => Category.find().order({name: 1}).all(cb),
            (models, cb)=> {
                this.items = models;
                async.eachSeries(models, this.countArticlesByCategory.bind(this), cb);
            },
            cb => {
                //this.items = this.items.filter(item => item.get('articleCount') > 0);
                this.items.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
                this.render('_parts/widgets/categories', cb);
            }
        ], cb);
    }

    countArticlesByCategory (category, cb) {
        async.waterfall([
            cb => category.relArticles().count(cb),
            (count, cb)=> {
                category.set('articleCount', count);
                cb();
            }
        ], cb);
    }
};

const async = require('async');
const Category = require('../../models/Category');