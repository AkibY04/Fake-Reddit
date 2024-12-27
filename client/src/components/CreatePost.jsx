import React, { useContext, useState, useEffect } from 'react';
import "../css/index.css";
import { AppContext } from './AppContext.jsx';
import axios from 'axios';

export default function CreatePost() {
    const { setCurrAccount, currAccount, currFlairs, setCurrFlairs, setCurrPosts, selectedButton, currCommunities, setCurrCommunities, setSelectedButton, setCurrFilteredPosts, setCurrSearchQuery, setCurrSelectedCommunity } = useContext(AppContext);
    const [sortedCommunities, setSortedCommunities] = useState([]);

    useEffect(() => {
        const userCommunities = currCommunities.filter(community =>
            currAccount.communitiesJoined?.includes(community._id)
        );

        const otherCommunities = currCommunities.filter(community =>
            !currAccount.communitiesJoined?.includes(community._id)
        );

        const sorted = [...userCommunities, ...otherCommunities];

        if (JSON.stringify(sorted) !== JSON.stringify(sortedCommunities)) {
            setSortedCommunities(sorted);
        }
    }, [currAccount, currCommunities, sortedCommunities]);

    async function handleSubmitPost(event) {
        event.preventDefault();
        const form = event.target.form;
        const formData = new FormData(form);

        let community = formData.get("community");
        let title = formData.get("title");
        let flair_options = formData.get("flair-options");
        let flair = formData.get("flair");
        let content = formData.get("content");
        let username = currAccount.displayName;

        if (!title || !community || !username || !content) {
            alert("Please fill in all required fields");
            return;
        }

        if (flair_options !== "CREATE NEW FLAIR" && flair !== "") {
            alert("Do not put text in the flair box if using pre-existing flair");
            return;
        }

        let chosenLinkFlair = null;

        if (flair_options === "CREATE NEW FLAIR") {
            chosenLinkFlair = flair;
        } else {
            chosenLinkFlair = flair_options;
        }

        let NO_FLAIR_FLAG = false;
        if (flair_options === "CREATE NEW FLAIR" && flair.length === 0) {
            NO_FLAIR_FLAG = true;
        }

        // Make new flar if needed
        let flair_object = null;
        for (const flair of currFlairs) {
            if (flair.content === chosenLinkFlair) {
                flair_object = flair; // reusing variable
            }
        }

        let flairID = null;
        if (NO_FLAIR_FLAG) {
            // nothing
        } else if (flair_object === null && chosenLinkFlair !== "") {

            let createFlair = await axios.post("http://localhost:8000/linkflairs/create", {
                content: chosenLinkFlair
            });

            let newFlair = createFlair.data;
            flairID = newFlair._id;

            setCurrFlairs(prevFlairs => [...prevFlairs, newFlair]);
        } else if (flair_object !== null) {
            flairID = flair_object.linkFlairID;
        }

        let createPost = await axios.post("http://localhost:8000/posts/create", {
            title: title,
            content: content,
            linkFlairID: flairID,
            postedBy: username,
        });

        let newPost = createPost.data;

        let postId = newPost._id;

        let newAcc = await axios.put("http://localhost:8000/accounts/update/" + currAccount._id, {
            addToPostsCreated: [newPost.id]
        });

        setCurrAccount(newAcc.data['updatedAccount']);
        document.cookie = `account=${encodeURIComponent(JSON.stringify(newAcc.data['updatedAccount']))}; path=/; max-age=259200; secure; samesite=strict`;

        setCurrPosts(prevPosts => [...prevPosts, newPost]);

        setCurrCommunities(prevCommunities =>
            prevCommunities.map(communityObj => {
                if (communityObj.name === community) {
                    return { ...communityObj, postIDs: [...communityObj.postIDs, postId] };
                }
                return communityObj;
            })
        );

        const communityToUpdate = currCommunities.find(communityObj => communityObj.name === community);
        if (communityToUpdate) {
            await axios.put("http://localhost:8000/communities/update/" + communityToUpdate._id, {
                postIDs: [...communityToUpdate.postIDs, postId]
            });
        } else {
            console.log("No community was found");
        }

        setSelectedButton("Home");
        setCurrFilteredPosts([]);
        setCurrSearchQuery("");
        setCurrSelectedCommunity({});

        form.reset();
    }

    return (
        <div id="create-post-view" style={{ display: selectedButton === "create-post-button" ? 'block' : 'none' }}>
            <form id="postForm">
                <label htmlFor="community">
                    <span style={{ color: 'red' }}>*</span>Community:
                </label>
                <select id="community" name="community" required>
                    <option value="" disabled>Select a community</option>
                    {sortedCommunities.map((community, index) => (
                        <option key={community._id || index} value={community.name}>
                            {community.name}
                        </option>
                    ))}
                </select>
                <br />
                <br />

                <label htmlFor="title">
                    <span style={{ color: 'red' }}>*</span>Post Title:
                </label>
                <input type="text" id="title" name="title" maxLength="100" required />
                <br />
                <br />

                <label htmlFor="flair">Flair: </label>
                <select id="flair-options" name="flair-options" defaultValue="CREATE-NEW-FLAIR" >
                    <option key="CREATE-NEW-FLAIR">CREATE NEW FLAIR</option>
                    {currFlairs.map((flair, index) => (
                        <option key={index} value={flair.content}>{flair.content}</option>
                    ))}
                </select>
                <input style={{ marginLeft: "5px" }} name="flair" id="flair" placeholder="New flair text here" maxLength="30" />
                <br />
                <br />

                <label className="post-content" htmlFor="content">
                    <span style={{ color: 'red' }}>*</span>Post Content:
                </label>
                <br />
                <textarea id="content" name="content" rows="4" cols="50" required></textarea>
                <br />
                <br />

                <button id="submit-post-button" type="submit" onClick={handleSubmitPost}>Submit Post</button>
            </form>
        </div>
    );
}
