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
        'static': {
        },
        'view': {
            // theme: 'sample'
        },
        'connection': {
            schema: 'mongodb',
            settings: {
                host: 'localhost',
                port: 27017,
                database: 'areto-basic',
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
        'viewEngine': {
            engine: require('ejs-locals'), 
            extension: 'ejs'
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
    router: {
        'errors': {
            Controller: require('../controller/DefaultController')
        }
    },
    params: {
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
        'tagList': {
            Class: require('../component/widget/TagList'),
            caching: false
        }
    },
    defaultController: 'article'
};