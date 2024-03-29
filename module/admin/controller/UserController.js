'use strict';

const Base = require('../component/CrudController');

module.exports = class UserController extends Base {

    static getConstants ()  {
        return {
            BEHAVIORS: {
                'access': {
                    Class: require('areto/filter/AccessControl'),
                    rules: [{
                        allow: true,
                        permissions: ['admin']
                    }]
                }
            }
        };
    }

    async actionIndex () {
        const {search} = this.getQueryParams();
        const provider = this.createDataProvider({
            query: this.spawn(User).findBySearch(search),
            sort: {
                attrs: {
                    [User.PK]: true,
                    name: true,
                    email: true,
                    role: true
                },
                defaultOrder: {[User.PK]: -1}
            }
        });
        await this.renderDataProvider(provider, 'index', {provider});
    }
};
module.exports.init(module);

const User = require('../model/User');