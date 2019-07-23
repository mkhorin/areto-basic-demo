'use strict';

module.exports = {

    // PERMISSION ITEMS

    'updateArticle': {
        type: 'permission'
    },

    'updateOwnArticle': {
        type: 'permission',
        children: ['updateArticle'],
        rule: 'author'
    },
    
    // ROLE ITEMS

    'admin': {
        type: 'role',
        children: [
            'moderator',
            'editor',
            'updateArticle'
        ]
    },

    'moderator': {
        type: 'role',
        children: ['reader']
    },

    'editor': {
        type: 'role',
        children: ['author']
    },

    'author': {
        type: 'role',
        children: [
            'reader',
            'updateOwnArticle'
        ]
    },

    'reader': {
        type: 'role'
    }
};