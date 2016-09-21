'use strict';

module.exports = {

    // ROLES

    'admin': {
        type: 'role',
        children: [
            'moderator',
            'editor'
        ]
    },

    'moderator': {
        type: 'role',
        children: ['reader']
    },

    'editor': {
        type: 'role',
        children: [
            'author'
        ]
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
    },

    // PERMISSIONS

    'updateArticle': {
        type: 'permission'
    },

    'updateOwnArticle': {
        type: 'permission',
        children: ['updateArticle'],
        rule: 'author'
    }
};