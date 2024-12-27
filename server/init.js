// initializeDB.js - Will add initial application data to MongoDB database
// Start the mongoDB service as a background process before running the script

// Usage: init.js mongodb://127.0.0.1:27017/phreddit admin@cse316.org admin password123
// (e.g., mongodb://127.0.0.1:27017/fake_so)

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');
const AccountModel = require('./models/accounts');

let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let mongoDB = userArgs[0];
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
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

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
    });
    return newCommunityDoc.save();
}

function createAccount(accountObj) {
    let newAccountDoc = new AccountModel({
        name: accountObj.name,
        email: accountObj.email,
        displayName: accountObj.displayName,
        password: accountObj.password,
        joinDate: accountObj.joinDate,
        reputation: accountObj.reputation,
        communitiesJoined: accountObj.communitiesJoined,
        communitiesCreated: accountObj.communitiesCreated,
        postsCreated: accountObj.postsCreated,
        commentsCreated: accountObj.commentsCreated
    })
    return newAccountDoc.save();
}

async function initializeDB() {
    // link flair objects
    const linkFlair1 = { // link flair 1
        linkFlairID: 'lf1',
        content: 'EPIK FAIL', 
    };
    const linkFlair2 = { //link flair 2
        linkFlairID: 'lf2',
        content: 'INSANE 5v1',
    };
    const linkFlair3 = { //link flair 3
        linkFlairID: 'lf3',
        content: 'Strategies',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'ULTRA NOOB',
    };
    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    
    // comment objects
    const comment7 = { // comment 7
        commentID: 'comment7',
        content: 'Generic poster slogan #42',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 10, 2024 09:43:00'),
    };
    let commentRef7 = await createComment(comment7);
    
    const comment6 = { // comment 6
        commentID: 'comment6',
        content: 'I want to believe.',
        commentIDs: [commentRef7],
        commentedBy: 'outtheretruth47',
        commentedDate: new Date('September 10, 2024 07:18:00'),
    };
    let commentRef6 = await createComment(comment6);
    
    const comment5 = { // comment 5
        commentID: 'comment5',
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 09, 2024 017:03:00'),
    }
    let commentRef5 = await createComment(comment5);
    
    const comment4 = { // comment 4
        commentID: 'comment4',
        content: 'The truth is out there.',
        commentIDs: [commentRef6],
        commentedBy: "astyanax",
        commentedDate: new Date('September 10, 2024 6:41:00'),
    };
    let commentRef4 = await createComment(comment4);
    
    const comment3 = { // comment 3
        commentID: 'comment3',
        content: 'you wish you were sigma like us, please leave immediately',
        commentIDs: [],
        commentedBy: 'rollo',
        commentedDate: new Date('August 23, 2024 09:31:00'),
    };
    let commentRef3 = await createComment(comment3);
    
    const comment2 = { // comment 2
        commentID: 'comment2',
        content: 'Obvious rage bait, the rizzler is the noobs we mogged along the way',
        commentIDs: [],
        commentedBy: 'astyanax',
        commentedDate: new Date('August 23, 2024 10:57:00'),
    };
    let commentRef2 = await createComment(comment2);
    
    const comment1 = { // comment 1
        commentID: 'comment1',
        content: 'please stop you are not funny',
        commentIDs: [commentRef3],
        commentedBy: 'shemp',
        commentedDate: new Date('August 23, 2024 08:22:00'),
    };
    let commentRef1 = await createComment(comment1);
    
    // post objects
    const post1 = { // post 1
        postID: 'p1',
        title: 'where is the rizzler this holiday season?',
        content: 'i was listening to thick of it by ksi and i was like, erm what the sigma, where is the rizzler? its already snowing? has anyone seem them? let me know, thanks',
        linkFlairID: linkFlairRef1,
        postedBy: 'alpha wolf',
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef1, commentRef2],
        views: 14,
    };
    const post2 = { // post 2
        postID: 'p2',
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: 'MarcoArelius',
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [commentRef4, commentRef5],
        views: 1023,
    };
    const post3 = {
        postID: 'p3',
        title: "HAHAHAHAHAHAHA",
        content: 'sorry i play league. any masters looking for duos?',
        linkFlairID: linkFlairRef3,
        postedBy: 'alpha wolf',
        postedDate: new Date('December 1, 2024 14:24:00'),
        commentIDs: [],
        views: 10,
    }
    let postRef1 = await createPost(post1);
    let postRef2 = await createPost(post2);
    let postRef3 = await createPost(post3);
    
    // community objects
    const community1 = {// community object 1
        communityID: 'community1',
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: ['alpha wolf', 'rollo', 'gorilla_enthusiast_77', 'shemp', 'catlady13', 'astyanax', 'trucknutz69'],
    };
    const community2 = { // community object 2
        communityID: 'community2',
        name: 'The Riot Games Fan Club',
        description: 'Are you an iron in league of legends? Yeah, we know. We dont want you. No free coaching. Uninstall.',
        postIDs: [postRef2, postRef3],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: ['alpha wolf', 'MarcoArelius', 'astyanax', 'outtheretruth47', 'bigfeet'],
    };
    let communityRef1 = await createCommunity(community1);
    let communityRef2 = await createCommunity(community2);

    const account1 = {
        name: "dakota",
        email: "dakota@cse316.org",
        displayName: "alpha wolf",
        password: bcrypt.hashSync("bananaFrosting123", 10),
        joinDate: new Date('Feb 13, 2004 02:48:00'),
        reputation: 6749,
        communitiesJoined: [communityRef1, communityRef2],
        communitiesCreated: [communityRef2],
        postsCreated: [postRef1, postRef3],
        commentsCreated: []
    };
    const account2 = {
        name: "akib",
        email: "akib@cse316.org",
        displayName: "gorilla_enthusiast_77",
        password: bcrypt.hashSync("juiceWRLD_heart494", 10), 
        joinDate: new Date("Nov 5, 1690 05:44:00"),
        reputation: -3000,
        communitiesJoined: [communityRef1],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: []
    };
    const account3 = {
        name: "leo",
        email: "leo@cse316.org",
        displayName: "rollo",
        password: bcrypt.hashSync("strangeLOOP_1995", 10),
        joinDate: new Date("Dec 12, 2005 09:30:00"),
        reputation: 450,
        communitiesJoined: [communityRef1],
        communitiesCreated: [communityRef1],
        postsCreated: [],
        commentsCreated: [commentRef3]
    };
    
    const account4 = {
        name: "sophia",
        email: "sophia@cse316.org",
        displayName: "shemp",
        password: bcrypt.hashSync("moonLit_sky43", 10),
        joinDate: new Date("Jan 19, 2018 14:15:00"),
        reputation: 1280,
        communitiesJoined: [communityRef1],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: [commentRef1]
    };
    
    const account5 = {
        name: "ryan",
        email: "ryan@cse316.org",
        displayName: "catlady13",
        password: bcrypt.hashSync("colorsplash2021", 10),
        joinDate: new Date("Mar 5, 2017 16:50:00"),
        reputation: 75,
        communitiesJoined: [communityRef1],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: []
    };
    
    const account6 = {
        name: "mia",
        email: "mia@cse316.org",
        displayName: "astyanax",
        password: bcrypt.hashSync("reactMaster#44", 10),
        joinDate: new Date("Aug 30, 2014 21:20:00"),
        reputation: 920,
        communitiesJoined: [communityRef1, communityRef2],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: [commentRef2, commentRef4]
    };
    
    const account7 = {
        name: "ethan",
        email: "ethan@cse316.org",
        displayName: "trucknutz69",
        password: bcrypt.hashSync("void_king404", 10),
        joinDate: new Date("Sep 2, 2011 08:12:00"),
        reputation: -50,
        communitiesJoined: [communityRef1],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: []
    };
    
    const account8 = {
        name: "ava",
        email: "ava@cse316.org",
        displayName: "MarcoArelius",
        password: bcrypt.hashSync("galaxy_wanderer42", 10),
        joinDate: new Date("Feb 15, 2020 10:25:00"),
        reputation: 300,
        communitiesJoined: [communityRef2],
        communitiesCreated: [],
        postsCreated: [postRef2],
        commentsCreated: []
    };
    
    const account9 = {
        name: "noah",
        email: "noah@cse316.org",
        displayName: "outtheretruth47",
        password: bcrypt.hashSync("binaryTree66", 10),
        joinDate: new Date("May 20, 2018 13:40:00"),
        reputation: 750,
        communitiesJoined: [communityRef2],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: [commentRef6]
    };
    
    const account10 = {
        name: "emma",
        email: "emma@cse316.org",
        displayName: "bigfeet",
        password: bcrypt.hashSync("haikuCoder99", 10),
        joinDate: new Date("Oct 3, 2015 19:50:00"),
        reputation: 120,
        communitiesJoined: [communityRef2],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: [commentRef5, commentRef7]
    };
    
    let accountRef1 = await createAccount(account1);
    let accountRef2 = await createAccount(account2);    
    let accountRef3 = await createAccount(account3);     
    let accountRef4 = await createAccount(account4);     
    let accountRef5 = await createAccount(account5);     
    let accountRef6 = await createAccount(account6);     
    let accountRef7 = await createAccount(account7);     
    let accountRef8 = await createAccount(account8);     
    let accountRef9 = await createAccount(account9);     
    let accountRef10 = await createAccount(account10);  
    
    // Create admin account
    const adminAccount = {
        name: "ADMINISTRATOR",
        email: userArgs[1],
        displayName: userArgs[2],
        password: bcrypt.hashSync(userArgs[3], 10), 
        joinDate: new Date("Jan 1, 1777 00:00:00"),
        reputation: 1000,
        communitiesJoined: [],
        communitiesCreated: [],
        postsCreated: [],
        commentsCreated: []
    };
    const adminAccountRef = await createAccount(adminAccount);
    
    if (db) {
        db.close();
    }
    console.log("done");
}

initializeDB()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');