import React from 'react'
import "../css/index.css"
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx'
import axios from 'axios';

export default function EditCommunity() {
    const { setCurrPosts, setCurrComments, setCurrAccounts, setCurrAccount, currAccount, setCurrSelectedCommunity, currObjectBeingEdited, selectedButton, setSelectedButton, setCurrCommunities } = useContext(AppContext);

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

    async function handleEngender(event) {
        event.preventDefault(); 
        const form = event.target.form;
        const formData = new FormData(form); 
    
        let desc = formData.get("desc");
        let name = formData.get("name");
    
        if (!name && !desc) {
            alert("Please edit something");
            return;
        }
    
        let newCom = await axios.put("http://localhost:8000/communities/update/"+currObjectBeingEdited, {
            name: name,
            description: desc,
        });

        let allComms = await axios.get("http://localhost:8000/communities")
        setCurrCommunities(allComms.data);

        setSelectedButton(name);
        setCurrSelectedCommunity(newCom.data["updatedCommunity"]); 

        let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
        setCurrAccount(updatedCurrAccount.data)
        document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
        
        updateStates()
        form.reset();
    }

    return (
        <div id="create-community-view" style={{ display: selectedButton === "edit-community-button" ? 'block' : 'none' }}>
        <form id="newCommunityForm">
            <label htmlFor="name">
            <span style={{ color: 'red' }}>*</span>New Community Name:
            </label>
            <input type="text" id="name" name="name" maxLength="100" required />
            <br />
            <br />

            <label htmlFor="desc">
            <span style={{ color: 'red' }}>*</span>New Description:
            </label>
            <br />
            <textarea id="desc" name="desc" rows="4" cols="50" maxLength="500" required></textarea>
            <br />
            <br />

            <button id="submit-community-button" type="submit" onClick={handleEngender}>Edit Community</button>
        </form>
        </div>
    )
}