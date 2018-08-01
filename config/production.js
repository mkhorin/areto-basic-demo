'use strict';

module.exports = {
    port: 8888,
    components: {
        'logger': {
            level: 'trace'
        },
        'static': {
            options: {
                maxAge: 10 * 60 * 1000
            }
        },
    },
    widgets: {
        'categories': {
            caching: true
        },
        'recentComments': {
            caching: true
        },
        'tagList': {
            caching: true
        }
    },
};