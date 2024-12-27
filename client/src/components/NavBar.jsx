import React from 'react';
import '../css/index.css';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext.jsx'
// import { getCommunityObjectByName } from './helpers.js';

function CommunityLink(props) {
    const { setHomeView, currCommunities, setCurrFilteredPosts, setCurrSelectedCommunity, setCurrSearchQuery, setSelectedButton, selectedButton} = useContext(AppContext);
    const handleClick = () => {
        let communityObj
        for (const community of currCommunities) {
            if (community.name === props.name) {
                communityObj = community
            }  
        }

        setCurrSelectedCommunity(communityObj)
        setSelectedButton(props.name);
        setCurrFilteredPosts([])
        setCurrSearchQuery("")

        setHomeView("");
    }

    return (
        <a 
        href={`/#${props.name}`} 
        className="community-link"
        onClick={handleClick}
        style={{ backgroundColor: selectedButton === props.name ? '#FF5700' : 'lightgray' }}
        >
            {props.name}
        </a>
    );
}

export default function NavBar({ refresher }) {

    const { currAccount, currAccountStatus, setHomeView, currCommunities, selectedButton, setSelectedButton, setCurrFilteredPosts, setCurrSearchQuery, setCurrSelectedCommunity } = useContext(AppContext);
    const  [sortedCommunities, setSortedCommunities] = useState([]);

    useEffect(() => {
        if (currAccountStatus === "Guest") {
            setSortedCommunities(currCommunities);
        } else {
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
        }
    }, [currAccount, currAccountStatus, currCommunities, sortedCommunities]); // Keep the dependencies as they are, but avoid redundant updates.
    
    

    const handleClick = () => {
        refresher();
        setSelectedButton("Home");
        setHomeView("");
        setCurrFilteredPosts([]);
        setCurrSearchQuery("");
        setCurrSelectedCommunity({});
    };

    const handleCreateCommunity = () => {
        if (currAccountStatus !== "Guest") {
            setSelectedButton("create-community-button");
        }
    };

    return (
        <div id="nav">
            <a
                href="/#home"
                className="home-link"
                id="home-link"
                onClick={handleClick}
                style={{ backgroundColor: selectedButton === "Home" ? '#FF5700' : 'lightgray' }}
                onMouseEnter={(button) => {
                    if (!(selectedButton === "Home")) {
                        button.currentTarget.style.backgroundColor = '#FF5700';
                    }
                }}
                onMouseLeave={(button) => {
                    if (!(selectedButton === "Home")) {
                        button.currentTarget.style.backgroundColor = 'lightgray';
                    } else {
                        button.currentTarget.style.backgroundColor = '#FF5700';
                    }
                }}
            >
                Home
            </a>

            <hr />

            <h4 className="nav-title">Communities</h4>

            <button
                id="create-community"
                onClick={handleCreateCommunity}
                style={{
                    backgroundColor: currAccountStatus === "Guest" ? 'gray' : (selectedButton === "create-community-button" ? '#FF5700' : 'lightgray'),
                    cursor: currAccountStatus === "Guest" ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(button) => {
                    if (currAccountStatus !== "Guest" && !(selectedButton === "create-community-button")) {
                        button.currentTarget.style.backgroundColor = '#FF5700';
                    }
                }}
                onMouseLeave={(button) => {
                    if (currAccountStatus !== "Guest" && !(selectedButton === "create-community-button")) {
                        button.currentTarget.style.backgroundColor = 'lightgray';
                    } else if (currAccountStatus !== "Guest") {
                        button.currentTarget.style.backgroundColor = '#FF5700';
                    }
                }}
            >
                Create Community
            </button>

            {sortedCommunities.map((community, index) => (
                <CommunityLink
                    key={index}
                    name={community.name}
                />
            ))}

        </div>
    );
}