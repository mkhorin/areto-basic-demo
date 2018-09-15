'use strict';

module.exports = {
    parent: 'default',
    port: 8888,
    components: {
        'logger': {
            level: 'info'
        }
    },
    params: {
        'static': {
            options: {
                maxAge: 10 * 60 * 1000
            }
        },
    },
    widgets: {
        'categories': {
            caching: true,
            cacheDuration: 10 // seconds
        },
        'recentComments': {
            caching: true,
            cacheDuration: 10
        },
        'tagList': {
            caching: true,
            cacheDuration: 10
        }
    },
};