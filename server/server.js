// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const bcrypt = require('bcrypt');

const Post = require('./models/posts.js');
const Community = require('./models/communities.js');
const Comment = require('./models/comments.js');
const LinkFlair = require('./models/linkflairs.js');
const Account = require('./models/accounts.js');
const { restart } = require('nodemon');

const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function() {
    console.log('Connected to database');
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
    res.status(200).send("Hello Phreddit!");
});

// Custom handlers

app.post("/accounts/verify", async (req, res) => {
    const { email, password } = req.body;

    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ error: "There is no account associated with this email" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, account.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "The password entered was incorrect" });
        }

        let userType = "user";
        if (email === "admin@cse316.org") {
            userType = "admin";
        }

        res.status(200).json({ 
            message: "Log in successful", 
            account: account,
            userType 
        });
    } catch (error) {
        console.error("Error verifying account:", error);
        res.status(500).send("Internal server error");
    }
});


// putting the C in CRUD
// putting the C in CRUD
// putting the C in CRUD

app.post("/posts/create", (req, res) => {
    const { title, content, linkFlairID, postedBy } = req.body;
    
    const post = new Post({
        title: title,
        content: content,
        linkFlairID: linkFlairID,
        postedBy: postedBy,
        commentIDs: []  
    });

    post.save()
        .then(savedPost => {
            console.log("Post saved:", savedPost);
            res.send(post);
        })
        .catch(error => {
            console.error("Error saving post:", error);
            res.send("Error saving post");
        });
});

app.post("/communities/create", (req, res) => {
    const { name, description, creator } = req.body;
    
    const community = new Community({
        name: name,
        description: description,
        postIDs: [],
        members: [creator],
        memberCount: 1,
    });

    community.save()
        .then(savedCommunity => {
            console.log("Community saved:", savedCommunity);
            res.send(community);
        })
        .catch(error => {
            console.error("Error saving Community:", error);
            res.send("Community made unsuccessfully");
        });
});

app.post("/comments/create", (req, res) => {
    const { content, creator } = req.body;
    
    const comment = new Comment({
        content: content,
        commentIDs: [],
        commentedBy: creator,
    });

    comment.save()
        .then(savedComment => {
            console.log("Comment saved:", savedComment);
            res.send(comment);
        })
        .catch(error => {
            console.error("Error saving Comment:", error);
            res.send("Comment made unsuccessfully");
        });
});

app.post("/linkflairs/create", (req, res) => {
    const { content } = req.body;
    
    const linkFlair = new LinkFlair({
        content: content,
    });

    linkFlair.save()
        .then(savedFlair => {
            console.log("linkFlair saved:", savedFlair);
            res.send(linkFlair);
        })
        .catch(error => {
            console.error("Error saving linkFlair:", error);
            res.send("error creating linkflair");
        });
});

app.post("/accounts/create", async (req, res) => {
    const { name, email, displayName, password, confirmPassword } = req.body;

    if (!name || !email || !displayName || !password || !confirmPassword) {
        return res.status(404).json({ error: "Please fill out all fields." });
    }

    

    if (password !== confirmPassword) {
        return res.status(404).json({ error: "Passwords do not match." });
    }

    const existingAccount = await Account.findOne({ email });

    if (existingAccount) {
        return res.status(404).json({ error: "This email is already registered." });
    }

    const existingDisplayName = await Account.findOne({ displayName });

    if (existingDisplayName) {
        return res.status(404).json({ error: "Display Name Taken." });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
        var account = new Account({
            name: name,
            email: email,
            displayName: displayName,
            password: hash
        });

        account.save()
        .then(savedAccount => {
            console.log("account saved:", savedAccount);
            res.status(200).json(account);
        })
        .catch(error => {
            console.error("Error creating account:", error);
            res.status(404).json({ error: "Error creating account"})
        });
    })
    
});

// putting the R in CRUD
// putting the R in CRUD
// putting the R in CRUD

app.get("/posts/:postId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
        if (!post) {
            return res.send("Post not found");
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.send("Error fetching post");
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts || []);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.send("Error fetching posts");
    }
});

app.get("/comments/:commentId", async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) {
            return res.send("comment not found");
        }
        res.status(200).json(comment);
    } catch (error) {
        console.error("Error fetching:", error);
        res.send("Error fetching");
    }
});

app.get("/comments", async (req, res) => {
    try {
        const comments = await Comment.find(); 
        res.status(200).json(comments || []);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.send("Error fetching comments");
    }
});

app.get("/communities/:communityId", async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId)
        if (!community) {
            return res.send("community not found");
        }
        res.json(community);
    } catch (error) {
        console.error("Error fetching:", error);
        res.send("Error fetching");
    }
});

app.get("/communities", async (req, res) => {
    try {
        const communities = await Community.find(); // Retrieves all communities
        if (communities.length === 0) {
            return res.send("No communities found");
        }
        res.status(200).json(communities);
    } catch (error) {
        console.error("Error fetching communities:", error);
        res.send("Error fetching communities");
    }
});


app.get("/linkflairs/:linkflairId", async (req, res) => {
    try {
        const linkFlair = await LinkFlair.findById(req.params.linkflairId)
        if (!linkFlair) {
            return res.status(404).send("flair not found");
        }
        res.status(200).json(linkFlair);
    } catch (error) {
        console.error("Error fetching:", error);
        res.send("Error fetching");
    }
});

app.get("/linkFlairs", async (req, res) => {
    try {
        const linkFlairs = await LinkFlair.find(); // Retrieves all communities
        if (linkFlairs.length === 0) {
            return res.status(404).send("No linkFlairs found");
        }
        res.status(200).json(linkFlairs);
    } catch (error) {
        console.error("Error fetching linkFlairs:", error);
        res.send("Error fetching linkFlairs");
    }
});

app.get("/accounts/:accountId", async (req, res) => {
    try {
        const account = await Account.findById(req.params.accountId)
        if (!account) {
            return res.status(404).send("account not found");
        }
        res.status(200).json(account);
    } catch (error) {
        console.error("Error fetching:", error);
        res.send("Error fetching");
    }
});

app.get("/accounts", async (req, res) => {
    try {
        const accounts = await Account.find(); // Retrieves all accounts
        if (accounts.length === 0) {
            return res.status(404).send("No accounts found");
        }
        res.status(200).json(accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.send("Error fetching accounts");
    }
});

// putting the U in CRUD
// putting the U in CRUD
// putting the U in CRUD
app.put("/posts/update/:postId", async (req, res) => {
    try {
        const { removeFromCommentIDs, title, content, linkFlairID, commentIDs, views, upvotes } = req.body;

        const updateObj = {
            ...(commentIDs && { commentIDs }),
            ...(title && { title }),
            ...(content && { content }),
            ...(linkFlairID && { linkFlairID }),
        };

        if (removeFromCommentIDs) {
            updateObj.$pull = {
                ...(updateObj.$pull || {}),
                commentIDs: { $in: removeFromCommentIDs },
            };
        }

        if (upvotes) {
            updateObj.$inc = { upvotes: upvotes };  
        }

        if (views) {
            updateObj.$inc = { views: 1};
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            updateObj,
            { new: true }  // return updated document
        );

        if (!updatedPost) {
            return res.send("Post not found");
        }

        res.send("Successfully updated post");
    } catch (error) {
        console.error("Error updating post:", error);
        res.send("Error updating post");
    }
});



app.put("/comments/update/:commentID", async (req, res) => {
    try {
        const { removeFromCommentIDs, content, commentIDs, upvotes } = req.body;
        // IT WAS COMMENTIDS NOT POSTIDS FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUCK
        // - 4:45am
        let updatedUpvotes = upvotes;
        if (typeof upvotes === 'number') {
            updatedUpvotes = { $inc: { upvotes } };
        }

        let updateFields = {
            ...(commentIDs && { commentIDs }),
            ...(content && { content }),
            ...(updatedUpvotes && updatedUpvotes)
        };

        if (removeFromCommentIDs) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                commentIDs: { $in: removeFromCommentIDs },
            };
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.commentID,
            updateFields,
            { new: true } 
        );

        if (!updatedComment) {
            return res.send("Comment not found");
        }

        res.send("Successfully updated comment");
    } catch (error) {
        console.error("Error updating comment:", error);
        res.send("Error updating comment");
    }
});

app.put("/communities/update/:communityID", async (req, res) => {
    try {
        const { removeFromMembers, addToMembers, removeFromPostIDs, name, description, postIDs } = req.body;

        // im so desperate idek anymore
        let updateFields = {};
        if (name) updateFields.name = name;
        if (description) updateFields.description = description;
        if (postIDs) updateFields.postIDs = postIDs;

        if (addToMembers) {
            updateFields.$addToSet = {
                ...(updateFields.$addToSet || {}),
                members: { $each: addToMembers },
            };
        }

        if (removeFromPostIDs) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                postIDs: { $in: removeFromPostIDs },
            };
        }

        if (removeFromMembers) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                members: { $in: removeFromMembers },
            };
        }

        const updatedCommunity = await Community.findByIdAndUpdate(
            req.params.communityID,
            updateFields,
            { new: true }
        );

        if (!updatedCommunity) {
            return res.status(404).send("Community not found");
        }

        res.send({ updatedCommunity });
    } catch (error) {
        console.error("Error updating Community:", error);
        res.status(500).send("Error updating Community");
    }
});


app.put("/accounts/update/:accountId", async (req, res) => {
    try {
        const { 
            name, 
            email, 
            displayName, 
            password, 
            addToCommunitiesJoined, 
            removeFromCommunitiesJoined,
            addToCommunitiesCreated, 
            removeFromCommunitiesCreated, 
            addToPostsCreated, 
            removeFromPostsCreated,
            addToCommentsCreated, 
            removeFromCommentsCreated,
            reputation 
        } = req.body;

        let updateFields = {
            ...(name && { name }),
            ...(email && { email }),
            ...(displayName && { displayName }),
        };

        // Hash the password if provided
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            updateFields.password = hash;
        }

        // Additions
        if (addToCommunitiesJoined) {
            updateFields.$addToSet = {
                ...(updateFields.$addToSet || {}),
                communitiesJoined: { $each: addToCommunitiesJoined },
            };
        }
        if (addToCommunitiesCreated) {
            updateFields.$addToSet = {
                ...(updateFields.$addToSet || {}),
                communitiesCreated: { $each: addToCommunitiesCreated },
            };
        }
        if (addToPostsCreated) {
            updateFields.$addToSet = {
                ...(updateFields.$addToSet || {}),
                postsCreated: { $each: addToPostsCreated },
            };
        }
        if (addToCommentsCreated) {
            updateFields.$addToSet = {
                ...(updateFields.$addToSet || {}),
                commentsCreated: { $each: addToCommentsCreated },
            };
        }

        // Removals
        if (removeFromCommunitiesJoined) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                communitiesJoined: { $in: removeFromCommunitiesJoined },
            };
        }
        if (removeFromCommunitiesCreated) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                communitiesCreated: { $in: removeFromCommunitiesCreated },
            };
        }
        if (removeFromPostsCreated) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                postsCreated: { $in: removeFromPostsCreated },
            };
        }
        if (removeFromCommentsCreated) {
            updateFields.$pull = {
                ...(updateFields.$pull || {}),
                commentsCreated: { $in: removeFromCommentsCreated },
            };
        }

        // Reputation Update
        if (typeof reputation === "number") {
            updateFields.$inc = { ...(updateFields.$inc || {}), reputation: reputation };
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.accountId,
            updateFields,
            { new: true } 
        );

        if (!updatedAccount) {
            return res.status(404).send("Account not found");
        }

        res.status(200).json({ message: "Successfully updated account", updatedAccount });
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: "Error updating account" });
    }
});



// putting the D in CRUD
// putting the D in CRUD
// putting the D in CRUD

app.delete("/comments/delete/:commentId", async (req, res) => {
    try {
        const commentObj = await Comment.findByIdAndDelete(req.params.commentId);

        if (!commentObj) {
            return res.status(404).send("Account not found");
        }

        res.send("Comment successfully deleted");
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).send("Error deleting comment");
    }
});

app.delete("/posts/delete/:postId", async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);

        if (!deletedPost) {
            return res.status(404).send("Account not found");
        }

        res.send("Post successfully deleted");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Error deleting post");
    }
});

app.delete("/communities/delete/:communityId", async (req, res) => {
    try {
        const deletedObj= await Community.findByIdAndDelete(req.params.communityId);

        if (!deletedObj) {
            return res.status(404).send("Account not found");
        }

        res.send("Community successfully deleted");
    } catch (error) {
        console.error("Error deleting Community:", error);
        res.status(500).send("Error deleting Community");
    }
});

app.delete("/accounts/delete/:accountId", async (req, res) => {
    try {
        const deletedAccount = await Account.findByIdAndDelete(req.params.accountId);

        if (!deletedAccount) {
            return res.status(404).send("Account not found");
        }

        res.send("Account successfully deleted");
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).send("Error deleting account");
    }
});

app.listen(8000, () => {console.log("Server listening on port 8000...");});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('“Server closed. Database instance disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Error: mongoose.connection.close().', error);
        process.exit(1);
    }
});