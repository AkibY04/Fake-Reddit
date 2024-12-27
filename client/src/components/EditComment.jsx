import React from 'react';
import "../css/index.css";
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx';
import axios from 'axios'

export default function EditComment() {
    const {setCurrCommunities, setCurrPosts, setCurrAccounts,  setCurrAccount, currAccount, currObjectBeingEdited, setSelectedButton, setCurrFilteredPosts, setCurrSearchQuery, setCurrSelectedCommunity, selectedButton, setCurrComments } = useContext(AppContext);

    async function updateStates() {
        var communities = await axios.get("http://localhost:8000/communities")
        var posts = await axios.get("http://localhost:8000/posts")
        var comments = await axios.get("http://localhost:8000/comments")
        var accounts = await axios.get("http://localhost:8000/accounts")
    
        setCurrCommunities(Array.from(communities.data))
        setCurrPosts(Array.from(posts.data))
        setCurrComments(Array.from(comments.data))
        setCurrAccounts(Array.from(accounts))
      }

    async function handleComment(event) {
        event.preventDefault(); 
        const form = event.target.form;
        const formData = new FormData(form); 

        let content = formData.get("comment-content");

        if (!content) {
            alert("Please edit the content");
            return;
        }

        await axios.put("http://localhost:8000/comments/update/"+currObjectBeingEdited, {
            content: content,
        })

        let allComments = await axios.get("http://localhost:8000/comments")
        setCurrComments(allComments.data);

        let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
        setCurrAccount(updatedCurrAccount.data)
        document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
         

        setSelectedButton("None");
        setCurrFilteredPosts([]);
        setCurrSearchQuery("");
        setCurrSelectedCommunity({});
        updateStates()
        form.reset();
    }

    return (
        <div id="create-comment-view" style={{ display: selectedButton === "edit-comment-button" ? 'block' : 'none' }}>
            <form id="newCommentForm">
                <label htmlFor="comment-content">
                    <span style={{ color: 'red' }}>*</span>New Comment:
                </label>
                <textarea id="comment-content" name="comment-content" maxLength="500" required></textarea>
                <br />
                <br />

                <button id="submit-comment-button" type="submit" onClick={handleComment}>Edit Comment</button>
            </form>
        </div>
    );
}
