'use strict';

module.exports = {
    parent: 'default',
    port: 3000,
    components: {
        'logger': {
            level: 'trace'
        },
        'scheduler': {
            refreshInterval: 10
        },
    }
};