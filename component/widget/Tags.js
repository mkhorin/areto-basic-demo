'use strict';

const Base = require('areto/view/Widget');

module.exports = class Tags extends Base {

    async execute () {
        this.tags = await this.spawn(Tag).find().all();
        for (const tag of this.tags) {
            await this.countArticlesByTag(tag);
        }
        this.tags = this.tags.filter(tag => tag.get('articleCount') > 0);
        this.tags.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
        return this.renderTemplate('_widget/tags');
    }

    async countArticlesByTag (tag) {
        tag.set('articleCount', await tag.relArticles().count());
    }
};

const Tag = require('../../model/Tag');