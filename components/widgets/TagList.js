'use strict';

const Base = require('areto/base/Widget');
const async = require('async');

module.exports = class TagList extends Base {

    run (cb) {        
        this.tags = [];
        let Tag = require('../../models/Tag');
        Tag.find().all((err, tags)=> {
            async.eachSeries(tags, (tag, cb)=> {
                tag.relArticles().count((err, count)=>{
                    if (count > 0) {
                        tag.set('articleCount', count);
                        this.tags.push(tag);
                    }
                    cb(err);
                })
            }, err => {
                this.tags.sort((a, b)=> {
                    return b.get('articleCount') - a.get('articleCount');
                });
                err ? cb(err) : this.render('_parts/widgets/tag-list', cb);
            });
        });
    }
};