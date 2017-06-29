'use strict';

module.exports = {
    port: 3000,
    components: {        
        'logger': {
            level: 'info',
            types: { // optional: separate storage of error logs
                'error': {
                    Class: require('areto/log/LogType'),
                    store: require('areto/log/FileLogStore')
                }
            }
        },
        'static': {
        },
        'connection': {
            schema: 'mongodb',
            settings: {
                host: 'localhost',
                port: 27017,
                database: 'areto-basic-2',
                options: {
                    bufferMaxEntries: 0,
                    keepAlive: 1
                }
            }
        },
        'cache': {            
             Class: require('areto/caching/MemoryCache')
        },
        'cookie': {
            secret: 'basic.app'
        },
        'session': {
            secret: 'basic.app',
            lifetime: 1800, // seconds
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
            language: 'en' // ru
        },
        'rbac': {            
        },
        'rateLimit': {
            attempts: 2
        },
        'scheduler': {
            tasks: {
                'fileCleaner': {
                    Class: require('../components/tasks/FileCleaner'),
                    interval: 3600 // seconds
                },
                'sessionCleaner': {
                    Class: require('../components/tasks/SessionCleaner'),
                    interval: 3600 // seconds
                }
            }            
        },
        'user': {
            Identity: require('../models/User'),
            loginUrl: '/auth/signin',
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
            Controller: require('../controllers/DefaultController')
        }
    },
    params: {
        'homeUrl': '/'
    },
    widgets: {
        'breadcrumbs': {
            Class: require('../components/widgets/Breadcrumbs'),
            baseLinks: [{title: 'Main', url: '/'}]
        },
        'recentComments': {
            Class: require('../components/widgets/RecentComments'),
            caching: false,
            // disabled: true
        },
        'tagList': {
            Class: require('../components/widgets/TagList'),
            caching: false,
           // disabled: true
        }
    },
    defaultController: 'article'
};