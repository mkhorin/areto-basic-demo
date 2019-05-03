'use strict';

const Base = require('areto/view/Widget');

module.exports = class TagList extends Base {

    async run () {
        this.tags = await this.spawn(Tag).find().all();
        for (let tag of this.tags) {
            await this.countArticlesByTag(tag);
        }
        this.tags = this.tags.filter(tag => tag.get('articleCount') > 0);
        this.tags.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
        return this.renderTemplate('_part/widget/tag-list');
    }

    async countArticlesByTag (tag) {
        tag.set('articleCount', await tag.relArticles().count());
    }
};

const Tag = require('../../model/Tag');