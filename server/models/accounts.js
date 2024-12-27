var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AccountSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        email: {type: String, required: true, maxLength: 100},
        displayName: {type: String, required: true, maxLength: 100},
        password: {type: String, required: true},
        joinDate: {type: Date, required: true, default: Date.now},
        reputation: {type: Number, required: true, default: 100},
        communitiesJoined: [{type: mongoose.Schema.Types.ObjectId, ref: 'Community'}],
        communitiesCreated: [{type: mongoose.Schema.Types.ObjectId, ref: 'Community'}],
        postsCreated: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
        commentsCreated: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
    }
);

AccountSchema.set('toJSON', { virtuals: true });
AccountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Account', AccountSchema);