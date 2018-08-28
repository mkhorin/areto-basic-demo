'use strict';

const Base = require('areto/view/Widget');

module.exports = class Categories extends Base {

    async run () {
        this.items = await Category.find().order({name: 1}).all();
        for (let item of this.items) {
            await this.countArticlesByCategory(item);
        }        
        this.items.sort((a, b)=> b.get('articleCount') - a.get('articleCount'));
        return this.render('_part/widget/categories');
    }

    async countArticlesByCategory (category) {        
        category.set('articleCount', await category.relArticles().count());
    }
};

const Category = require('../../model/Category');