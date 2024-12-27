var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
        content: {type: String, required: true, maxLength: 500},
        commentIDs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
        commentedBy: {type: String, required: true},
        commentedDate: {type: Date, required: true, default: Date.now},
        upvotes: {type: Number, required: true, default: 0}
    }
);

CommentSchema
  .virtual('url')
  .get(function () {
    return 'comments/' + this._id;
  });

CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);