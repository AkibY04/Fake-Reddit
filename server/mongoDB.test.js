const mongoose = require('mongoose');
const Post = require('./models/posts.js');
const Comment = require('./models/comments.js');

// from init.js
function createComment(commentObj) {
    let newCommentDoc = new Comment({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new Post({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
    });
    return newPostDoc.save();
}

describe('test 2', () => {
    let postId, commentIds;

    beforeAll(async () => {
        // Connect to the database
        const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';
        await mongoose.connect(mongoDB);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        db.on('connected', function() {
            console.log('Connected to database');
        });

        const comment1 = {
            commentID: 'comment3',
            content: 'you wish you were sigma like us, please leave immediately',
            commentIDs: [],
            commentedBy: 'rollo',
            commentedDate: new Date('August 23, 2024 09:31:00'),
        };
        let commentRef1 = await createComment(comment1);

        const comment2 = {
            commentID: 'comment3',
            content: 'you wish you were sigma like us, please leave immediately',
            commentIDs: [commentRef1],
            commentedBy: 'rollo',
            commentedDate: new Date('August 23, 2024 09:31:00'),
        };
        let commentRef2 = await createComment(comment2);

        const comment3 = {
            commentID: 'comment3',
            content: 'you wish you were sigma like us, please leave immediately',
            commentIDs: [commentRef2],
            commentedBy: 'rollo',
            commentedDate: new Date('August 23, 2024 09:31:00'),
        };
        let commentRef3 = await createComment(comment3);

        // sample post
        const post = await createPost({ 
            postID: 'p1',
            title: 'where is the rizzler this holiday season?',
            content: 'i was listening to thick of it by ksi and i was like, erm what the sigma, where is the rizzler? its already snowing? has anyone seem them? let me know, thanks',
            linkFlairID: null,
            postedBy: 'alpha wolf',
            postedDate: new Date('August 23, 2024 01:19:00'),
            commentIDs: [commentRef3],
            views: 14,
        })
        postId = post._id;

        commentIds = [comment1._id, comment2._id, comment3._id];
    });

    test('Test 1 - Recursive deleting', async () => {

        const idsToCheck = [postId, ...commentIds];

        await Post.findByIdAndDelete(postId);
        await Comment.deleteMany({ commentIds });

        // check that all IDs are removed
        for (const id of idsToCheck) {
            const postOrComment = await mongoose.connection.db.collection('posts').findOne({ _id: id })
                               || await mongoose.connection.db.collection('comments').findOne({ _id: id });
            expect(postOrComment).toBeNull();
        }
    });
});
