'use strict';

module.exports = {

    mountPath: '/',
    port: 3000,

    components: {        
        'logger': {
            level: 'info'
        },
        'actionProfiler': {
            Class: require('areto/log/ActionProfiler'),
            level: 'debug'
        },
        'view': {
             // theme: 'sample'
        },
        'db': {
            Class: require('areto/db/MongoDatabase'),
            settings: {
                'host': process.env.MONGO_HOST || 'localhost',
                'port': process.env.MONGO_PORT || 27017,
                'database': process.env.MONGO_NAME || 'areto-basic'
            }
        },
        'cache': {            
            Class: require('areto/cache/MemoryCache')
        },
        'cookie': {
            secret: 'basic.app'
        },
        'router': {
            errors: {
                'controller': 'default'
            },
            defaultController: 'article'
        },
        'session': {
            secret: 'basic.app',
            lifetime: 'PT30M', // see ISO_8601#Duration
            store: {
                'Class': require('areto/web/session/DatabaseSessionStore'),
                'table': 'session'
            }
        },
        'bodyParser': {
            limit: '10mb'
        },
        'i18n': {
            language: 'en'
        },
        'rbac': {            
        },
        'rateLimit': {
            attempts: 3
        },
        'auth': {
            Identity: require('../model/User'),
            loginUrl: '/auth/sign-in',
            returnUrl: '/',
            enableAutoLogin: true,
            identityCookie: {
                'httpOnly': true,
                'path': '/'
            },
            defaultAssignments: ['reader']
        },
        'scheduler': {}
    },
    modules: {
        'admin': {}
    },
    params: {
        'template': {
            engine: require('areto-ejs'),
            extension: 'ejs'
        },
        'static': {},
        'homeUrl': '/'
    },
    widgets: {
        'breadcrumbs': {
            Class: require('../component/widget/Breadcrumbs'),
            baseLinks: [{
                title: 'Main',
                url: ''
            }]
        },
        'categories': {
            Class: require('../component/widget/Categories'),
            caching: false,
            disabled: false
        },
        'recentComments': {
            Class: require('../component/widget/RecentComments'),
            caching: false
        },
        'tags': {
            Class: require('../component/widget/Tags'),
            caching: false
        }
    }
};