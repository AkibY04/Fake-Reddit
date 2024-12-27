import React from 'react';
import '../css/index.css';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext.jsx'
import { timestamp } from './helpers.js';
import axios from 'axios';

const fetchCommunities = async (communitiesJoined) => {
    const fetchedData = [];
    for (const communityID of communitiesJoined) {
        try {
            const response = await axios.get(`http://localhost:8000/communities/${communityID}`);
            fetchedData.push(response.data);
        } catch (error) {
            console.error(`Couldn't fetch community because: ${communityID}:`, error);
        }
    }
    return fetchedData;
};

export default function PageHeader(props) {
    const { setCurrAccount, currAccount, currAccountStatus, currPosts, currFilteredPosts, currSearchQuery, currSelectedCommunity } = useContext(AppContext);
    const [communityData, setCommunityData] = useState([]);
    const [communityMemberCount, setCommunityMemberCount] = useState(0)
    const postsArr = currPosts;

    const handleNewestClick = () => {
        props.changeMode("new")
    };

    const handleOldestClick = () => {
        props.changeMode("old")
    };

    const handleActiveClick = () => {
        props.changeMode("active")
    };

    const handleJoin = async (currComm) => {

        if (isMember) {
            await axios.put("http://localhost:8000/accounts/update/"+currAccount._id, {
                removeFromCommunitiesJoined: [currComm._id]
            });
            await axios.put("http://localhost:8000/communities/update/"+currComm.id, {
                removeFromMembers: [currAccount.displayName]
            });
            setIsMember(false)
            
            setCommunityMemberCount(communityMemberCount-1);
        } else {
            await axios.put("http://localhost:8000/accounts/update/"+currAccount._id, {
                addToCommunitiesJoined: [currComm._id]
            });
            await axios.put("http://localhost:8000/communities/update/"+currComm._id, {
                addToMembers: [currAccount.displayName]
            });
            setIsMember(true)
            
            setCommunityMemberCount(communityMemberCount+1);
        }

        let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
        setCurrAccount(updatedCurrAccount.data)
        document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
                
    }

    useEffect(() => {
        if (currSelectedCommunity && Array.isArray(currSelectedCommunity.members)) {
            setCommunityMemberCount(currSelectedCommunity.members.length);
        }
    }, [currSelectedCommunity]);

    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        if (currAccountStatus !== "Guest" && Array.isArray(currAccount.communitiesJoined)) {
            fetchCommunities(currAccount.communitiesJoined).then(fetchedData => {
                if (JSON.stringify(fetchedData) !== JSON.stringify(communityData)) {
                    setCommunityData(fetchedData);
                }
            });
        }
    }, [currAccountStatus, currAccount.communitiesJoined, communityData]); 

    useEffect(() => {
        setIsMember(communityData.some(community => community._id === currSelectedCommunity._id));
    }, [communityData, currSelectedCommunity]);

    return (
        <div className="home-header">
            <div className="home-header-left">
                <span className="home-title">
                    {(() => {
                        //Show all posts
                        if (currSearchQuery === "" && Object.keys(currSelectedCommunity).length === 0) { 
                            return <>
                                All Posts
                                <br />
                                <span style={{ fontSize: '65%' }}>
                                {postsArr.length} post(s)
                                </span>
                            </>
                        //Search query inputted but no posts found
                        } else if (currFilteredPosts.length === 0 && Object.keys(currSelectedCommunity).length === 0) {
                            return <>
                                No results found
                                <br />
                                <span style={{ fontSize: '65%' }}>
                                0 post(s)
                                </span>
                            </>
                        //Search query inputted and posts were found
                        } else if (currFilteredPosts.length !== 0 && Object.keys(currSelectedCommunity).length === 0) {
                            return <>
                                Results for: {currSearchQuery}
                                <br />
                                <span style={{ fontSize: '65%' }}>
                                {currFilteredPosts.length} post(s)
                                </span>                            
                            </>
                        //Community view
                        } else {
                            return <>
                                {currSelectedCommunity.name}
                                <br />
                                <span  style={{ fontSize: '65%' }}>{currSelectedCommunity.description}</span>
                                <br />
                                <span  style={{ fontSize: '65%' }}>Created {timestamp(currSelectedCommunity.startDate)}</span>
                                <br />
                                <span style={{ fontSize: '65%' }}>
                                {currSelectedCommunity.postIDs.length} post(s) | {communityMemberCount} member(s)
                                </span> 
                                <br />
                                {currAccountStatus !== "Guest" && ( 
                                    <>
                                        <button onClick={() => handleJoin(currSelectedCommunity)}>{isMember ? "Leave" : "Join"}</button>
                                    </>
                                )}
                            </>
                        }

                    })()} 
                    
                </span>
            </div>

            <div className="home-header-right">
                <button id="new-button" onClick={handleNewestClick}>New</button>
                <button id="old-button" onClick={handleOldestClick}>Old</button>
                <button id="active-button" onClick={handleActiveClick}>Active</button>
            </div>
        </div>
    );
}