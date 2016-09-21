'use strict';

module.exports = {
    components: {
        'static': {},
    },
    widgets: {
        'breadcrumbs': {
            baseLinks: [
                {title: 'Main', url: '/'},
                {title: 'Admin', url: '/admin'}
            ]
        },
        'sideMenu': {
            Class: require('../../../components/widgets/SideMenu')
        }
    }
};