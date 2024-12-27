var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommunitySchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        description: {type: String, required: true, maxLength: 500},
        postIDs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
        startDate: {type: Date, required: true, default: Date.now},
        members: [{type: String, required: true}],
    }
);

CommunitySchema
  .virtual('url')
  .get(function () {
    return 'communities/' + this._id;
  });

CommunitySchema
  .virtual('memberCount')
  .get(function () {
    return this.members.length;
  });

CommunitySchema.set('toJSON', { virtuals: true });
CommunitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Community', CommunitySchema);