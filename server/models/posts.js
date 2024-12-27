var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
    {
        title:  {type: String, required: true, maxLength: 100},
        content: {type: String, required: true},
        linkFlairID: {type: mongoose.Schema.Types.ObjectId, ref: 'LinkFlair'},
        postedBy: {type: String, required: true},
        postedDate: {type: Date, required: true, default: Date.now},
        commentIDs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
        views: {type: Number, required: true, default: 0},
        upvotes: {type: Number, required: true, default: 0}
    }
);

PostSchema
  .virtual('url')
  .get(function () {
    return 'posts/' + this._id;
  });

PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);