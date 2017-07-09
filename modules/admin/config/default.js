'use strict';

module.exports = {
    components: {
        'static': {},
        'i18n': {
            sources: {
                'admin': require('areto/i18n/JsMessageSource')
            }
        },

    },
    widgets: {
        'breadcrumbs': {
            baseLinks: [
                {title: 'Main', url: '/admin'}
            ]
        },
        'sideMenu': {
            Class: require('../components/widgets/SideMenu')
        }
    }
};