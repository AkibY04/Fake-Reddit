import React from 'react'
import "../css/index.css"
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx'
import axios from 'axios'

export default function EditPost() {
    const {setCurrCommunities, setCurrComments, setCurrAccounts, setCurrAccount, currAccount, setCurrPosts, setHomeView, currObjectBeingEdited, currFlairs, setCurrFlairs, selectedButton, setSelectedButton, setCurrFilteredPosts, setCurrSearchQuery, setCurrSelectedCommunity } = useContext(AppContext);

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

    async function handleSubmitPost(event) {
        event.preventDefault(); 
        const form = event.target.form;
        const formData = new FormData(form); 

        let title = formData.get("title")
        let flair_options = formData.get("flair-options")
        let flair = formData.get("flair")
        let content = formData.get("content")

        if (!title && !content && !flair && !flair_options) {
            alert("Please edit at least one item.");
            return;
        }

        if (flair_options!=="CREATE NEW FLAIR" && flair !== "") {
            alert("Do not put text in the flair box if using pre-existing flair")
            return;
        }

        let chosenLinkFlair = null

        if (flair_options==="CREATE NEW FLAIR") {
            chosenLinkFlair = flair
        } else {
            chosenLinkFlair = flair_options
        }

        let NO_FLAIR_FLAG = false
        if (flair_options==="CREATE NEW FLAIR" && flair.length===0) {
            NO_FLAIR_FLAG = true
        }

         // find the flair, or create a new one if needed
        let flair_object = null;
        for (const flair of currFlairs) {
            if (flair.content === chosenLinkFlair) {
            flair_object = flair // reusing variable
            }
        }

        let flairID = null;
        if (NO_FLAIR_FLAG) {
            // nothing
        }else if (flair_object === null && chosenLinkFlair !== "") {

            let createFlair = await axios.post("http://localhost:8000/linkflairs/create", {
                content: chosenLinkFlair
            });

            let newFlair = createFlair.data
            flairID = newFlair._id

            setCurrFlairs(prevFlairs => [...prevFlairs, newFlair]);
        } 
        else if (flair_object !== null) {
            flairID = flair_object.linkFlairID;
        }

        await axios.put("http://localhost:8000/posts/update/"+currObjectBeingEdited, {
            title: title,
            content: content,
            linkFlairID: flairID
        })

        let allPosts = await axios.get("http://localhost:8000/posts")
        setCurrPosts(allPosts.data);

        let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
        setCurrAccount(updatedCurrAccount.data)
        document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
         
        
        setSelectedButton("Home")
        setHomeView(currObjectBeingEdited);
        setCurrFilteredPosts([])
        setCurrSearchQuery("")
        setCurrSelectedCommunity({})
        updateStates()
        form.reset();
        
    }

    return (
        <div id="create-post-view" style={{ display: selectedButton === "edit-post-button" ? 'block' : 'none' }}>
        <form id="postForm">
            <label htmlFor="title">
            <span style={{ color: 'red' }}>*</span>New Post Title:
            </label>
            <input type="text" id="title" name="title" maxLength="100" required />
            <br />
            <br />

            <label htmlFor="flair">New Flair: </label>
            <select id="flair-options" name="flair-options" defaultValue="CREATE-NEW-FLAIR" >
                <option key="CREATE-NEW-FLAIR">CREATE NEW FLAIR</option>
                {(() => {return <> {
                    currFlairs.map((flair, index) => (
                        <option key={index} value={flair.content}>{flair.content}</option>
                    ))
                } </>})()} 
            </select>
            <input style={{marginLeft: "5px"}} name="flair" id="flair" placeholder="New flair text here" maxLength="30"/>
            <br />
            <br />

            <label className="post-content" htmlFor="content">
            <span style={{ color: 'red' }}>*</span>New Post Content:
            </label>
            <br />
            <textarea id="content" name="content" rows="4" cols="50" required></textarea>
            <br />
            <br />

            <button id="submit-post-button" type="submit" onClick={handleSubmitPost}>Edit Post</button>
        </form>
        </div>

    )
}