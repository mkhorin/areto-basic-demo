'use strict';

const Base = require('areto/view/Widget');

module.exports = class Categories extends Base {

    async run () {
        this.items = await this.spawn(Category).find().order({name: 1}).all();
        for (const item of this.items) {
            await this.countArticlesByCategory(item);
        }        
        this.items.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
        return this.renderTemplate('_part/widget/categories');
    }

    async countArticlesByCategory (category) {        
        category.set('articleCount', await category.relArticles().count());
    }
};

const Category = require('../../model/Category');