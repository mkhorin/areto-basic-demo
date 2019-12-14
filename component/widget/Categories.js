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
        const activeId = this.controller.getQueryParam('category');
        categories.sort((a, b)=> b.count - a.count);
        return this.renderTemplate('_widget/categories', {categories, activeId});
    }
};

const Category = require('../../model/Category');