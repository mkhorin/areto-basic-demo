'use strict';

module.exports = {
    components: {
        'i18n': {
            sources: {
                'admin': require('areto/i18n/JsMessageSource')
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
            period: 3600, // seconds
            job: {
                Class: require('../component/job/ExpiredFileCleaner'),
                timeout: 3600
            }
        },
        'expiredSessionCleaner': {
            period: 3600,
            job: require('../component/job/ExpiredSessionCleaner')
        }
    },
    widgets: {
        'breadcrumbs': {
            baseLinks: [{
                title: 'Main',
                url: 'admin'
            }]
        },
        'sideMenu': {
            Class: require('../component/widget/SideMenu')
        }
    }
};