'use strict';

let path = require('path');

module.exports = {
    port: 3000,
    components: {        
        'logger': {
            level: 'info'
        },
        'static': {},
        'connection': {
            schema: 'mongodb',
            settings: {
                host: 'localhost',
                port: 27017,
                database: 'areto-basic',
                user: '',
                password: '',
                options: {
                    db: {
                        bufferMaxEntries: 0
                    },
                    server: {
                        socketOptions: {
                            keepAlive: 1
                        }
                    }
                }
            }
        },
        'cache': {            
             Class: require('areto/caching/MemoryCache')
        },
        'cookie': {},
        'session': {
            secret: 'basic.app',
            store: {
                Class: require('areto/web/MongoSessionStore'), 
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
        },
        'rbac': {            
        },
        'scheduler': {
            tasks: { 
                'sessionCleaner': {
                    Class: require('../components/tasks/SessionCleaner'),
                    period: 3600
                },
                'fileCleaner': {
                    Class: require('../components/tasks/FileCleaner'),
                    period: 3600
                }
            }            
        },
        'userConfig': {
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
    defaultController: 'article',
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
            caching: true
            // disabled: true
        },
        'tagList': {
            Class: require('../components/widgets/TagList'),
           // disabled: true,
            caching: true
        }
    }
};