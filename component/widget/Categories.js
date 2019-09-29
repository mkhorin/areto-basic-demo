'use strict';

const Base = require('areto/view/Widget');

module.exports = class Categories extends Base {

    async run () {
        this.items = await this.spawn(Category).find().order({name: 1}).all();
        const categories = [];
        for (const item of this.items) {
            const count = await item.relArticles().count();
            if (count) {
                categories.push({item, count});
            }
        }        
        categories.sort((a, b)=> b.count - a.count);
        return this.renderTemplate('_part/widget/categories', {categories});
    }
};

const Category = require('../../model/Category');