'use strict';

const Base = require('areto/db/ActiveRecord');

module.exports = class Comment extends Base {

    static getConstants () {
        return {
            TABLE: 'comment',
            ATTRS: [                 
                'articleId', 
                'name',
                'email',
                'ip',
                'content', 
                'status',                
                'createdAt', 
                'updatedAt'
            ],
            INDEXES: [
                [{entityId: 1}, {unique: false}]
            ],
            RULES: [
                [['name','email','content'], 'required'],
                ['name', 'string', {min: 2, max: 32}],
                ['email', 'email'],
                ['content', 'string', {min: 3, max: 512}]
            ],
            BEHAVIORS: {
                'timestamp': require('areto/behavior/TimestampBehavior')
            },
            STATUS_PENDING: 'pending',
            STATUS_APPROVED: 'approved',
            STATUS_REJECTED: 'rejected'
        };
    }

    status = this.STATUS_PENDING;

    findRecent (limit = 3) {
        return this.findApproved().order({[Comment.PK]: -1}).limit(limit);
    }

    findApproved () {
        return this.find({status: this.STATUS_APPROVED});
    }

    getTitle () {
        return this.get('content');
    }

    isPending () {
        return this.get('status') === this.STATUS_PENDING;
    }

    isApproved () {
        return this.get('status') === this.STATUS_APPROVED;
    }

    isRejected () {
        return this.get('status') === this.STATUS_REJECTED;
    }
};
module.exports.init(module);