'use strict';

module.exports = {
    components: {
        'i18n': {
            sources: {
                'admin': require('areto/i18n/FileMessageSource')
            }
        }
    },
    params: {
        'dashboard': {
            cacheDuration: 10 // seconds
        }
    },
    tasks: {
        'expiredFileCleaner': {            
            job: {
                Class: require('../component/job/ExpiredFileCleaner'),
                expirationTimeout: 3600
            },
            period: 3600
        },
        'expiredSessionCleaner': {            
            job: {
                Class: require('../component/job/ExpiredSessionCleaner')
            },
            period: 3600
        }
    },
    widgets: {
        'breadcrumbs': {
            baseLinks: [{
                title: 'Dashboard',
                url: 'admin'
            }]
        },
        'sideMenu': {
            Class: require('../component/widget/SideMenu')
        }
    }
};