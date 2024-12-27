import React from 'react';
import "../css/index.css";
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx';
import axios from 'axios'

export default function CreateComment() {
    const { setCurrAccount, currAccount, currPostTarget, setSelectedButton, setCurrFilteredPosts, setCurrSearchQuery, setCurrSelectedCommunity, setHomeView, selectedButton, currComments, currPosts, setCurrPosts, setCurrComments, currCommentTarget } = useContext(AppContext);

    async function handleComment(event) {
        event.preventDefault(); 
        const form = event.target.form;
        const formData = new FormData(form); 

        let username = currAccount.displayName
        let content = formData.get("comment-content");

        if (!username || !content) {
            alert("Missing info for comment or username");
            return;
        }

        let createComment = await axios.post("http://localhost:8000/comments/create", {
            content: content,
            creator: username,
        })

        let newComment = createComment.data

        let newCommentId = newComment._id

        currComments.push(newComment);
        setCurrComments(prevComments => [...prevComments, newComment]);

        if (currCommentTarget.startsWith("post-")) { 
            console.log("Commenting to a post");

            const parentPostID = currCommentTarget.substring(5);
            const postObj = currPosts.find(post => post._id === parentPostID);
            postObj.commentIDs = [...postObj.commentIDs, newCommentId]; 

            const newPosts = currPosts.map(post => post._id === postObj._id ? postObj : post);

            await axios.put("http://localhost:8000/posts/update/" + postObj._id, {
                commentIDs: postObj.commentIDs
            });
            
            setCurrPosts(newPosts); 
            setHomeView(postObj._id);
        } 
        else if (currCommentTarget.startsWith("comment-")) { // Replying to a comment
            console.log("Replying to a comment: " + currCommentTarget);

            const parentCommentID = currCommentTarget.substring(8);
            const parentComment = currComments.find(comment => comment._id === parentCommentID);
            
            await axios.put("http://localhost:8000/comments/update/" + parentCommentID, {
                commentIDs: [...parentComment.commentIDs, newCommentId]
            });
            parentComment.commentIDs.push(newCommentId);

            const parentPost = currPosts.find(post => post._id === currPostTarget);
            
            const updatedPost = { ...parentPost, commentIDs: [...parentPost.commentIDs] };
            const newPosts = currPosts.map(post => post._id === updatedPost._id ? updatedPost : post);
            
            setCurrPosts(newPosts);
            setHomeView(updatedPost._id);
        }

        let newAcc = await axios.put("http://localhost:8000/accounts/update/"+currAccount._id, {
            addToCommentsCreated: [newCommentId]
        });

        setCurrAccount(newAcc.data['updatedAccount'])
        document.cookie = `account=${encodeURIComponent(JSON.stringify(newAcc.data['updatedAccount']))}; path=/; max-age=259200; secure; samesite=strict`;

        setSelectedButton("None");
        setCurrFilteredPosts([]);
        setCurrSearchQuery("");
        setCurrSelectedCommunity({});

        form.reset();
    }

    return (
        <div id="create-comment-view" style={{ display: selectedButton === "create-comment-button" ? 'block' : 'none' }}>
            <form id="newCommentForm">
                <label htmlFor="comment-content">
                    <span style={{ color: 'red' }}>*</span>Comment:
                </label>
                <textarea id="comment-content" name="comment-content" maxLength="500" required></textarea>
                <br />
                <br />

                <button id="submit-comment-button" type="submit" onClick={handleComment}>Submit Comment</button>
            </form>
        </div>
    );
}
