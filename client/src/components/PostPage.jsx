import React, { useContext, useState } from 'react';
import '../css/index.css';
import { timestamp, countPostComments } from './helpers';
import { AppContext } from './AppContext.jsx';
import { findLatestCommentDate } from './helpers';
import axios from 'axios';

function Comment({ postObj, commentObj, depth }) {
    const { setCurrAccount, currAccount, currAccountStatus, setCurrPostTarget, currComments, setCurrCommentTarget, setSelectedButton } = useContext(AppContext);
    const [currUpvotes, setCurrUpvotes] = useState(commentObj.upvotes);

    if (!commentObj || !commentObj.commentIDs) return null;

    const sortedReplies = commentObj.commentIDs
        .map(replyID => currComments.find(comment => comment._id === replyID))
        .sort((a, b) =>
            findLatestCommentDate(b._id, currComments) - findLatestCommentDate(a._id, currComments)
        );

    const handleReply = () => {
        setSelectedButton("create-comment-button");
        setCurrCommentTarget("comment-" + commentObj._id);
        setCurrPostTarget(postObj._id);
    };

    const handleUpvote = async () => {
        try {
            if(currAccount.reputation < 50){
                alert("Reputation is too low to vote");
                return;
            }

            const response = await axios.get("http://localhost:8000/accounts"); // Fetch all accounts
            const accounts = response.data;

            const account = accounts.find(account => account.displayName === commentObj.commentedBy);
            if (account) {
                await axios.put(`http://localhost:8000/accounts/update/${account._id}`, {
                    reputation: 5, 
                });

                let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
                setCurrAccount(updatedCurrAccount.data)
                document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
                
            } else {
                console.error("Account not found for upvoting comment");
            }

            commentObj.upvotes += 1;
            setCurrUpvotes(currUpvotes+1);
            await axios.put(`http://localhost:8000/comments/update/${commentObj._id}`, {
                upvotes: 1,  
            });
        } catch (err) {
            console.error("Failed to upvote comment:", err);
        }
    };

    const handleDownvote = async () => {
        try {
            if(currAccount.reputation < 50){
                alert("Reputation is too low to vote");
                return;
            }

            const response = await axios.get("http://localhost:8000/accounts"); // Fetch all accounts
            const accounts = response.data;

            const account = accounts.find(account => account.displayName === commentObj.commentedBy);
            if (account) {


                await axios.put(`http://localhost:8000/accounts/update/${account._id}`, {
                    reputation: -10, 
                });

                let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
                setCurrAccount(updatedCurrAccount.data)
                document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
                

                
            } else {
                console.error("Account not found for downvoting comment");
            }

            commentObj.upvotes += -1;
            setCurrUpvotes(currUpvotes-1);
            await axios.put(`http://localhost:8000/comments/update/${commentObj._id}`, {
                upvotes: -1,  
            });
        } catch (err) {
            console.error("Failed to downvote comment:", err);
        }
    };

    return (
        <>
            <div className="comment" style={{ marginLeft: depth * 5 + "%" }}>
                <p className="comment-header">
                    {commentObj.commentedBy} | {timestamp(commentObj.commentedDate)} | Upvotes: {currUpvotes}
                </p>
                <p>{commentObj.content}</p>
                {currAccountStatus !== "Guest" && (
                    <>
                        <button onClick={handleReply}>Reply</button>
                        <button onClick={handleUpvote} style={{ marginLeft: '0.25%' }}>Upvote</button>
                        <button onClick={handleDownvote} style={{ marginLeft: '0.25%' }}>Downvote</button>
                    </>
                )}

                {sortedReplies.map((reply, index) => (
                    <Comment
                        key={index}
                        postObj={postObj}
                        commentObj={reply}
                        depth={depth + 1}
                    />
                ))}
            </div>
        </>
    );
}

export default function PostPage({ postObj }) {
    const { setCurrAccount, currAccount, currAccountStatus, currComments, currFlairs, currCommunities, setSelectedButton, setCurrCommentTarget } = useContext(AppContext);
    const [accounts, setAccounts] = useState([]);
    const [currUpvotes, setCurrUpvotes] = useState(postObj.upvotes);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get("http://localhost:8000/accounts");
            setAccounts(response.data); // Store all accounts
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
        }
    };

    // Fetch accounts only once when the component is mounted
    React.useEffect(() => {
        fetchAccounts();
    }, []);

    const handleUpvote = async () => {
        try {
            if(currAccount.reputation < 50){
                alert("Reputation is too low to vote");
                return;
            }

            const account = accounts.find(account => account.displayName === postObj.postedBy);
            if (account) {
                await axios.put(`http://localhost:8000/accounts/update/${account._id}`, {
                    reputation: 5, 
                });

                let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
                setCurrAccount(updatedCurrAccount.data)
                document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
                

               
            } else {
                console.error("Account not found for upvoting post");
            }
            
            postObj.upvotes += 1;
            setCurrUpvotes(currUpvotes+1);
            await axios.put(`http://localhost:8000/posts/update/${postObj._id}`, {
                upvotes: 1,  
            });
        } catch (err) {
            console.error("Failed to upvote post:", err);
        }
    };

    const handleDownvote = async () => {
        try {
            if(currAccount.reputation < 50){
                alert("Reputation is too low to vote");
                return;
            }

            const account = accounts.find(account => account.displayName === postObj.postedBy);
            if (account) {
                await axios.put(`http://localhost:8000/accounts/update/${account._id}`, {
                    reputation: -10,
                });

                let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
                setCurrAccount(updatedCurrAccount.data)
                document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
                


            } else {
                console.error("Account not found for downvoting post");
            }

            postObj.upvotes += -1;
            setCurrUpvotes(currUpvotes-1);
            await axios.put(`http://localhost:8000/posts/update/${postObj._id}`, {
                upvotes: -1,  
            });
        } catch (err) {
            console.error("Failed to downvote post:", err);
        }
    };

    // Find the community and flair for the post
    const community = currCommunities.find(community => community.postIDs.includes(postObj._id));
    
    let flair = null;
    if (postObj.linkFlairID) {
        flair = currFlairs.find(f => f._id.toString() === postObj.linkFlairID.toString());
    }

    const sortedPostComments = postObj.commentIDs
        .map(commentId => currComments.find(comment => comment._id === commentId))
        .sort((a, b) =>
            findLatestCommentDate(b._id, currComments) - findLatestCommentDate(a._id, currComments)
        );

    const handleComment = () => {
        setSelectedButton("create-comment-button");
        setCurrCommentTarget("post-" + postObj._id);
    };

    return (
        <div>
            <span><i>{community?.name}</i> | {timestamp(postObj.postedDate)}</span>
            <br />
            <span>{postObj.postedBy}</span>
            <br />
            <h2>{postObj.title}</h2>
            {flair && <span className="post-flair">{flair.content}</span>}
            <p>{postObj.content}</p>
            <div className="post-footer">
            <span>{postObj.views} views | {countPostComments(currComments, postObj)} comment(s) | Upvotes: {currUpvotes}</span>
            </div>
            <br />
            {currAccountStatus !== "Guest" && (
                <>
                    <button id="add-comment-button" onClick={handleComment}>Add a comment</button>
                    <button id="add-comment-button" onClick={handleUpvote} style={{ marginLeft: '0.25%' }}>Upvote</button>
                    <button id="add-comment-button" onClick={handleDownvote} style={{ marginLeft: '0.25%' }}>Downvote</button>
                </>
            )}
            <hr style={{ width: '100%' }}></hr>
            {sortedPostComments.map((comment, index) => (
                <Comment
                    key={index}
                    postObj={postObj}
                    commentObj={comment}
                    depth={0}
                />
            ))}
        </div>
    );
}
