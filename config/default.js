'use strict';

module.exports = {

    //mountPath: "/test",
    port: 3000,

    components: {        
        'logger': {
            level: 'info',
            types: { // optional: separate storage for error logs
                'error': {
                    Class: require('areto/log/LogType'),
                    store: require('areto/log/FileLogStore')
                }
            }
        },
        'view': {
            // theme: 'sample'
        },
        'connection': {
            schema: 'mongodb',
            settings: {
                host: process.env.MONGO_HOST || 'localhost',
                port: process.env.MONGO_PORT || 27017,
                database: process.env.MONGO_NAME || 'areto-basic',
                options: {
                    bufferMaxEntries: 0,
                    keepAlive: true,
                    useNewUrlParser: true
                }
            }
        },
        'cache': {            
            Class: require('areto/cache/MemoryCache'),
            duration: 100, // seconds
        },
        'cookie': {
            secret: 'basic.app'
        },
        'session': {
            secret: 'basic.app',
            lifetime: 30 * 60, // seconds
            store: {
                Class: require('areto/web/session/DbSessionStore'),
                table: 'session'
            }
        },
        'bodyParser': {
            limit: '10mb'
        },
        'i18n': {
            // language: 'ru'
        },
        'rbac': {            
        },
        'rateLimit': {
            attempts: 3
        },
        'scheduler': {
        },
        'user': {
            UserModel: require('../model/User'),
            loginUrl: '/auth/sign-in',
            returnUrl: '/',
            enableAutoLogin: true,
            identityCookie: {
                httpOnly: true,
                path: '/'
            },
            defaultAssignments: ['reader']
        }        
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
    router: {
        'errors': {
            Controller: require('../controller/DefaultController')
        }
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
        'tagList': {
            Class: require('../component/widget/TagList'),
            caching: false
        }
    },
    defaultController: 'article'
};