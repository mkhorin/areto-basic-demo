'use strict';

const Base = require('areto/view/Widget');

module.exports = class TagList extends Base {

    run (cb) {
        async.waterfall([
            cb => Tag.find().all(cb),
            (tags, cb)=> {
                this.tags = tags;
                async.eachSeries(tags, this.countArticlesByTag.bind(this), cb);
            },
            cb => {
                this.tags = this.tags.filter(tag => tag.get('articleCount') > 0);
                this.tags.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
                this.render('_part/widget/tag-list', cb);
            }
        ], cb);
    }

    countArticlesByTag (tag, cb) {
        async.waterfall([
            cb => tag.relArticles().count(cb),
            (count, cb)=> {
                tag.set('articleCount', count);
                cb();
            }
        ], cb);
    }
};

const async = require('areto/helper/AsyncHelper');
const Tag = require('../../model/Tag');