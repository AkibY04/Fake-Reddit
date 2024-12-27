import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./AppContext.jsx";
import "../css/index.css";
import axios from "axios";

export default function UserProfile() {
  const { setCurrCommunities, setCurrPosts, setCurrComments, setCurrAccounts, setCurrAccount, setCurrObjectBeingEdited, currAccountStatus, selectedButton, currAccount, setSelectedButton } = useContext(AppContext);
  const [activeListing, setActiveListing] = useState("communities")
  const [communityData, setCommunityData] = useState([]);
  const [postData, setPostData] = useState([]);
  const [commentData, setCommentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  //Just updates the default listing when user profile is clicked based on if user is admin or not
  useEffect(() => {
    if (currAccountStatus === "admin") {
      setActiveListing("user-listings");
    } else {
      setActiveListing("communities");
    }
  }, [currAccountStatus]);

  function handleEditPost(objId) {
    setSelectedButton("edit-post-button");

    setCurrObjectBeingEdited(objId)
  }

  function handleEditComment(objId) {
    setSelectedButton("edit-comment-button");

    setCurrObjectBeingEdited(objId)
  }

  function handleEditCommunity(objId) {
    setSelectedButton("edit-community-button");

    setCurrObjectBeingEdited(objId)
  }
  
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

  async function handleDeletePost(objId) {
    try {
      let obj = await axios.get(`http://localhost:8000/posts/${objId}`);
      let commentIDs = obj.data.commentIDs;

      for (let commentID of commentIDs) {
        await handleDeleteComment(commentID);
      }

      await axios.delete(`http://localhost:8000/posts/delete/${objId}`);

      let modifiedAccountId = currAccount._id

      if (selectedUser) {
        modifiedAccountId = selectedUser._id;
        // Update selectedUser state to remove the deleted post
        setSelectedUser(prev => ({
          ...prev,
          postsCreated: prev.postsCreated.filter(id => id !== objId)
        }));
      }
      
      await axios.put("http://localhost:8000/accounts/update/"+ modifiedAccountId, {
        removeFromPostsCreated: [objId]
      });

      let allCommunities = await axios.get("http://localhost:8000/communities")
      let comm = allCommunities.data.find(comm => comm.postIDs.includes(objId));
      await axios.put("http://localhost:8000/communities/update/"+comm._id, {
        removeFromPostIDs: [objId]
      });
      
      updateStates()

      let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
      setCurrAccount(updatedCurrAccount.data)
      document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;

    } catch (error) {
        console.error("Error deleting post:", error);
    }
  }

  async function handleDeleteComment(objId) {
    try {
      let obj = await axios.get(`http://localhost:8000/comments/${objId}`);
      let commentIDs = obj.data.commentIDs || []

      for (let commentID of commentIDs) {
          await handleDeleteComment(commentID);
      }


      if (selectedUser) {
        // Update selectedUser state to remove the deleted comment
        setSelectedUser(prev => ({
          ...prev,
          commentsCreated: prev.commentsCreated.filter(id => id !== objId)
        }));
      }

      // Remove the comment ID from its parent comment, if any
      let allComments = await axios.get("http://localhost:8000/comments");
      let parentComment = allComments.data.find(comment => comment.commentIDs.includes(objId));
      if (parentComment) {
          await axios.put(`http://localhost:8000/comments/update/${parentComment._id}`, {
            removeFromCommentIDs: [objId],
          });
      }

      let allAccounts = await axios.get("http://localhost:8000/accounts");
      let acc = allAccounts.data.find(acc => acc.commentsCreated.includes(objId));
      if (acc) {
        await axios.put(`http://localhost:8000/accounts/update/${acc._id}`, {
          removeFromCommentsCreated: [objId],
      });
      }

      // Remove the comment ID from the post it belongs to
      let allPosts = await axios.get("http://localhost:8000/posts");
      let post = allPosts.data.find(post => post.commentIDs.includes(objId));
      if (post) {
          await axios.put(`http://localhost:8000/posts/update/${post._id}`, {
              removeFromCommentIDs: [objId],
          });
      }

      await axios.delete(`http://localhost:8000/comments/delete/${objId}`);

      updateStates()

      // Update the current account and cookie
      let updatedCurrAccount = await axios.get(`http://localhost:8000/accounts/${currAccount._id}`);
      setCurrAccount(updatedCurrAccount.data);
      document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;

    } catch (error) {
        console.error("Error deleting comment:", error);
    }
  }

  async function handleDeleteCommunity(objId, showConfirm, bypass) {
    if(showConfirm === true){
      if (bypass || window.confirm("Are you sure you want to delete this community?")){
        try {
          let obj = await axios.get(`http://localhost:8000/communities/${objId}`);
    
          let postIDs = obj.data.postIDs

          let modifiedAccountId = currAccount._id

          if (selectedUser) {
            modifiedAccountId = selectedUser._id;
            // Update selectedUser state to remove the deleted community
            setSelectedUser(prev => ({
              ...prev,
              communitiesCreated: prev.communitiesCreated.filter(id => id !== objId),
              communitiesJoined: prev.communitiesJoined.filter(id => id !== objId)
            }));
          }
    
          for (let postID of postIDs) {
            await handleDeletePost(postID);
          }
    
          await axios.delete(`http://localhost:8000/communities/delete/${objId}`);
    
          await axios.put("http://localhost:8000/accounts/update/"+modifiedAccountId, {
            removeFromCommunitiesCreated: [objId],
            removeFromCommunitiesJoined: [objId]
          });

          // look for ALL users with that community
          let allAccs = await axios.get("http://localhost:8000/accounts");
          let accs = allAccs.data.filter(acc => acc.communitiesJoined.includes(objId));
          for (let acc of accs) {
            await axios.put("http://localhost:8000/accounts/update/"+acc._id, {
              removeFromCommunitiesJoined: [objId]
            });
          }

          updateStates()
          
          let updatedCurrAccount = await axios.get("http://localhost:8000/accounts/"+currAccount._id)
          setCurrAccount(updatedCurrAccount.data)
          document.cookie = `account=${encodeURIComponent(JSON.stringify(updatedCurrAccount.data))}; path=/; max-age=259200; secure; samesite=strict`;
    
          

        } catch (error) {
            console.error("Error deleting community:", error);
        }
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")){
      try {
        let allAccounts = await axios.get("http://localhost:8000/accounts");
        const userToDelete = allAccounts.data.find(user => user._id === userId);
    
        if (!userToDelete) return;

        for (let commentID of userToDelete.commentsCreated || []) {
          await handleDeleteComment(commentID);
        }

        for (let postID of userToDelete.postsCreated || []) {
          await handleDeletePost(postID);
        }

        for (let commID of userToDelete.communitiesCreated || []) {
          await handleDeleteCommunity(commID, true, true);
        }
        
        await axios.delete(`http://localhost:8000/accounts/delete/${userId}`);
    
        //Remove from the user listing
        setUserData(prevData => prevData.filter(user => user._id !== userId));

        updateStates()
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };
  

  function formatJoinDate(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  useEffect(() => {
    //reset any prior data
    setCommunityData([]);
    setPostData([]);
    setCommentData([]);

    //Fetches data from desired schema based on params
    const fetchData = async (type, ids, setData) => {
      const fetchedData = [];
      for (const id of ids) {
        try {
          const response = await axios.get(`http://localhost:8000/${type}/${id}`);
          fetchedData.push(response.data);
        } catch (error) {
          console.error(`Error fetching ${type} with ID ${id}:`, error);
        }
      }
      setData(fetchedData);
    };

    const userToFetch = selectedUser || currAccount;

    //Fetches info based on listing button pressed
    if (currAccountStatus !== "Guest") {
      if (activeListing === "communities" && userToFetch.communitiesCreated?.length) {
        fetchData("communities", userToFetch.communitiesCreated, setCommunityData);
      }
      if (activeListing === "posts" && userToFetch.postsCreated?.length) {
        fetchData("posts", userToFetch.postsCreated, setPostData);
      }
      if (activeListing === "comments" && userToFetch.commentsCreated?.length) {
        fetchData("comments", userToFetch.commentsCreated, setCommentData);
      }

      if (activeListing === "user-listings" && currAccountStatus === "admin") {
        const fetchUsers = async () => {
          try {
            const response = await axios.get("http://localhost:8000/accounts");
            setUserData(response.data);
          } catch (error) {
            console.error("Couldn't get accounts:", error);
          }
        };
        fetchUsers();
      }
    }
  }, [activeListing, currAccountStatus, currAccount, selectedUser]);

  //Default active listing when a user is selected from admin view
  useEffect(() => {
    if (selectedUser) {
      setActiveListing("communities");
    }
  }, [selectedUser]); 

  return (
    <div
      className="user-profile"
      style={{ display: selectedButton === "user-profile-button" ? "block" : "none" }}
    >
      <section className="user-info">
        <h2 style={{ borderBottom: "0.07em solid black", paddingBottom: "1%" }}>
          {selectedUser ? "Selected User Profile" : "User Profile"}
        </h2>
        
        {/* User Info */}
        <p>
          <strong>Display Name:</strong> {selectedUser ? selectedUser.displayName : currAccount.displayName}
        </p>
        <p>
          <strong>Email Address:</strong> {selectedUser ? selectedUser.email : currAccount.email}
        </p>
        <p>
          <strong>Member Since:</strong> {formatJoinDate(selectedUser ? selectedUser.joinDate : currAccount.joinDate)}
        </p>
        <p>
          <strong>Reputation:</strong> {selectedUser ? selectedUser.reputation : currAccount.reputation}
        </p>
      </section>

      {/* Listing Buttons */}
      <section className="listing-navigation">
        {currAccountStatus === "admin" && !selectedUser && (
          <button onClick={() => setActiveListing("user-listings")}>User Listings</button>
        )}

        {selectedUser && currAccountStatus === "admin" && (
          <button
            onClick={() => {
              setSelectedUser(null); 
              setActiveListing("user-listings"); 
            }}
          >
            Go Back to Admin View
          </button>
        )}

        <button onClick={() => setActiveListing("communities")}>Communities</button>
        <button onClick={() => setActiveListing("posts")}>Posts</button>
        <button onClick={() => setActiveListing("comments")}>Comments</button>
      </section>

      {/* Communities */}
      <section className="listing-content">
        {activeListing === "communities" && (
          <div className="community-listing">
            <h3>Communities Created</h3>
            <ul>
              {communityData.length > 0 ? (
                communityData.map((community, index) => (
                  <li key={community._id || index}>
                    <button
                      onClick={() => handleEditCommunity(community._id)}
                      style={{ all: "unset", textDecoration: "underline", marginRight: "1%", cursor: "pointer" }}
                    >
                      {community.name}
                    </button>
                    <button
                      onClick={()=> handleDeleteCommunity(community._id, true, false)}
                    >Delete</button>
                  </li>
                ))
              ) : (
                <p style={{fontStyle: 'italic'}}>No communities created</p>
              )}
            </ul>
          </div>
        )}
        {/* Posts */}
        {activeListing === "posts" && (
          <div className="post-listing">
            <h3>Posts Created</h3>
            <ul>
              {postData.length > 0 ? (
                postData.map((post, index) => (
                  <li key={post._id || index}>
                    <button
                      onClick={() => handleEditPost(post._id)}
                      style={{ all: "unset", marginRight: "1%", textDecoration: "underline", cursor: "pointer" }}
                    >
                      {post.title}
                    </button>
                    <button
                      onClick={()=> handleDeletePost(post._id)}
                    >Delete</button>
                  </li>
                ))
              ) : (
                <p style={{fontStyle: 'italic'}}>No posts created</p>
              )}
            </ul>
          </div>
        )}
        {/* Comments */}
        {activeListing === "comments" && (
          <div className="comment-listing">
            <h3>Comments Created</h3>
            <ul>
              {commentData.length > 0 ? (
                commentData.map((comment, index) => (
                  <li key={comment._id || index}>
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      style={{ all: "unset", marginRight: "1%", textDecoration: "underline", cursor: "pointer" }}
                    >
                      {
                        comment.content.slice(0, 20)}...
                    </button>
                    <button
                      onClick={()=> handleDeleteComment(comment._id)}
                    >Delete</button>
                  </li>
                ))
              ) : (
                <p style={{fontStyle: 'italic'}}>No comments created</p>
              )}
            </ul>
          </div>
        )}
        {/* Other users (only shows for admin) */}
        {activeListing === "user-listings" && currAccountStatus === "admin" && (
          <div className="user-listing">
            <h3>All Users</h3>
            <ul>
              {userData.length > 0 ? (
                userData.map((user) => (
                  <li key={user._id}>
                    <button style={{ all: "unset", textDecoration: "underline", marginBottom: "1%", marginRight: '2%', cursor: "pointer" }} onClick={() => setSelectedUser(user)}>{user.displayName} | {user.email} | {user.reputation} Reputation</button>
                    <button style={{ marginBottom: "1%"}} onClick={() => handleDeleteUser(user._id)}>Delete User</button>
                  </li>
                ))
              ) : (
                <p>No users found</p>
              )}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
