import React from 'react'
import "../css/index.css"
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx'
import axios from 'axios';

export default function CreateCommunity() {
    const { currCommunities, setCurrAccount, selectedButton, setSelectedButton, setCurrSelectedCommunity, setCurrCommunities, currAccount } = useContext(AppContext);

    async function handleEngender(event) {
        event.preventDefault(); 
        const form = event.target.form;
        const formData = new FormData(form); 
    
        let desc = formData.get("desc");
        let name = formData.get("name");
        let creator = currAccount.displayName;
    
        if (!name || !desc || !creator) {
            alert("Please fill in all required fields");
            return;
        }
        
        if (currCommunities.some(community => community.name?.toLowerCase() === name.toLowerCase())) {
            alert("This community name already exists. Please enter a unique name");
            return; 
        }
    
        let createdCommunity = await axios.post("http://localhost:8000/communities/create", {
            name: name,
            description: desc,
            creator: creator
        });
    
        setCurrSelectedCommunity(createdCommunity.data); 
        setCurrCommunities(prevCommunities => [...prevCommunities, createdCommunity.data]);
        setSelectedButton(name);

        let newAcc = await axios.put("http://localhost:8000/accounts/update/"+currAccount._id, {
            addToCommunitiesCreated: [createdCommunity.data._id],
            addToCommunitiesJoined: [createdCommunity.data._id]
        });

        setCurrAccount(newAcc.data['updatedAccount'])
        document.cookie = `account=${encodeURIComponent(JSON.stringify(newAcc.data['updatedAccount']))}; path=/; max-age=259200; secure; samesite=strict`;

    
        form.reset();
    }

    return (
        <div id="create-community-view" style={{ display: selectedButton === "create-community-button" ? 'block' : 'none' }}>
        <form id="newCommunityForm">
            <label htmlFor="name">
            <span style={{ color: 'red' }}>*</span>Community Name:
            </label>
            <input type="text" id="name" name="name" maxLength="100" required />
            <br />
            <br />

            <label htmlFor="desc">
            <span style={{ color: 'red' }}>*</span>Description:
            </label>
            <br />
            <textarea id="desc" name="desc" rows="4" cols="50" maxLength="500" required></textarea>
            <br />
            <br />

            <button id="submit-community-button" type="submit" onClick={handleEngender}>Engender Community</button>
        </form>
        </div>
    )
}