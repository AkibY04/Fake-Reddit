import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext.jsx'
import '../css/index.css';
import PageHeader from './PageHeader.jsx';
import Post from './Post.jsx';
import PostPage from './PostPage.jsx';
import { newPostSort, oldPostSort, activePostSort } from './helpers.js';
import CreatePost from './CreatePost.jsx'
import CreateComment from './CreateComment.jsx'
import CreateCommunity from './CreateCommunity.jsx'
import UserProfile from './UserProfile.jsx';
import EditPost from './EditPost.jsx';
import EditComment from './EditComment.jsx';
import EditCommunity from './EditCommunity.jsx'

export default function HomePage(props) {
  const { currComments, setHomeView, homeView, currFlairs, currCommunities, currPosts, currFilteredPosts, currSearchQuery, currSelectedCommunity, selectedButton, currAccount } = useContext(AppContext);
  const [sortMode, setSortMode] = useState("new");

  const changeMode = (nextMode) => {
    setSortMode(nextMode);
  };

  const renderNoPosts = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>
        <p>No posts found</p>
      </div>
    );
  }
  
  let postsArr = currPosts;
  const communities = currCommunities;
  const linkFlairs = currFlairs;

  if (currFilteredPosts.length !== 0) {
    postsArr = currFilteredPosts;
  }

  if (sortMode === "new") {
    postsArr = newPostSort(postsArr);
  } else if (sortMode === "old") {
    postsArr = oldPostSort(postsArr);
  } else if (sortMode === "active") {
    postsArr = activePostSort(postsArr, currComments);
  }

  let postObj = null;
  if (homeView) {
    postObj = postsArr.find(post => post._id === homeView);
  }

  return (
    <div className="home">
      <CreatePost />
      <CreateCommunity />
      <CreateComment />
      <UserProfile />
      <EditPost />
      <EditCommunity />
      <EditComment />

      <div className="homePosts" style={{ display: selectedButton === "create-post-button" || selectedButton === "create-community-button" || selectedButton === "create-comment-button" || selectedButton === "user-profile-button" || selectedButton === "edit-post-button" || selectedButton === "edit-comment-button" || selectedButton === "edit-community-button" ? 'none' : 'block' }}>
        
        {homeView === "" ? //all posts or filtered posts
          <>
            <PageHeader changeMode={changeMode} />
            <div className="post-list">
              {(() => {
                //search
                if (currSearchQuery !== "") {
                  const searchResults = postsArr.filter(post => post.title.toLowerCase().includes(currSearchQuery.toLowerCase()));

                  if (!currAccount) { 
                    return (
                      <>
                        {searchResults.length > 0 ? (
                          searchResults.map(postObj => (
                            <Post
                              key={postObj._id}
                              postObj={postObj}
                              communities={communities}
                              linkFlairs={linkFlairs}
                              setHomeView={setHomeView}
                            />
                          ))
                        ) : renderNoPosts()}
                      </>
                    );
                  }

                  //Render user posts
                  const userCommunityPosts = searchResults.filter(post =>
                    currCommunities.some(community =>
                      currAccount.communitiesJoined.includes(community._id) && community.postIDs.includes(post._id)
                    )
                  );
                  const otherCommunityPosts = searchResults.filter(post =>
                    !currCommunities.some(community =>
                      currAccount.communitiesJoined.includes(community._id) && community.postIDs.includes(post._id)
                    )
                  );

                  return (
                    <>
                      <h3 style={{ textAlign: 'center', marginBottom: '1.5%' }}>Posts From Your Communities</h3>
                      <div className='dotted-line'></div>
                      {userCommunityPosts.length > 0 ? (
                        userCommunityPosts.map(postObj => (
                          <Post
                            key={postObj._id}
                            postObj={postObj}
                            communities={communities}
                            linkFlairs={linkFlairs}
                            setHomeView={setHomeView}
                          />
                        ))
                      ) : renderNoPosts()}

                      <h3 style={{ textAlign: 'center', marginBottom: '1.5%' }}>Posts From Other Communities</h3>
                      <div className='dotted-line'></div>
                      {otherCommunityPosts.length > 0 ? (
                        otherCommunityPosts.map(postObj => (
                          <Post
                            key={postObj._id}
                            postObj={postObj}
                            communities={communities}
                            linkFlairs={linkFlairs}
                            setHomeView={setHomeView}
                          />
                        ))
                      ) : renderNoPosts()}
                    </>
                  );
                } 
                //community link
                else if (Object.keys(currSelectedCommunity).length !== 0) {
                  const communityPosts = postsArr.filter(post => 
                    currSelectedCommunity.postIDs.includes(post._id)
                  );
                  if (communityPosts.length <= 0) {
                    return renderNoPosts();
                  }
                  return (
                    <>
                      {communityPosts.map(postObj => (
                        <Post
                          key={postObj._id}
                          postObj={postObj}
                          communities={communities}
                          linkFlairs={linkFlairs}
                          setHomeView={setHomeView}
                          showCommunity={false} 
                        />
                      ))}
                    </>
                  );
                }
                //display users community posts and other community posts
                else if (currAccount && currAccount.communitiesJoined) {
                  const userCommunities = currAccount.communitiesJoined; // Communities the user is a part of
                  const userCommunityPosts = postsArr.filter(post =>
                    currCommunities.some(community =>
                      userCommunities.includes(community._id) && community.postIDs.includes(post._id)
                    )
                  );
                  const otherCommunityPosts = postsArr.filter(post =>
                    !currCommunities.some(community =>
                      userCommunities.includes(community._id) && community.postIDs.includes(post._id)
                    )
                  );
                  
                  return (
                    <>
                      <h3 style={{textAlign: 'center', marginBottom: '1.5%'}}>Posts From Your Communities</h3>
                      <div className='dotted-line'></div>
                      {userCommunityPosts.length > 0 ? (
                        userCommunityPosts.map(postObj => (
                          <Post
                            key={postObj._id}
                            postObj={postObj}
                            communities={communities}
                            linkFlairs={linkFlairs}
                            setHomeView={setHomeView}
                          />
                        ))
                      ) : renderNoPosts()}

                      <h3 style={{textAlign: 'center', marginBottom: '1.5%'}}>Posts From Other Communities</h3>
                      <div className='dotted-line'></div>
                      {otherCommunityPosts.length > 0 ? (
                        otherCommunityPosts.map(postObj => (
                          <Post
                            key={postObj._id}
                            postObj={postObj}
                            communities={communities}
                            linkFlairs={linkFlairs}
                            setHomeView={setHomeView}
                          />
                        ))
                      ) : renderNoPosts()}
                    </>
                  );
                }
                //display all posts
                else {
                  return (
                    <>
                      {postsArr.length > 0 ? (
                        postsArr.map(postObj => (
                          <Post
                            key={postObj._id}
                            postObj={postObj}
                            communities={communities}
                            linkFlairs={linkFlairs}
                            setHomeView={setHomeView}
                          />
                        ))
                      ) : renderNoPosts()}
                    </>
                  );
                }
              })()}
            </div>
          </>
          : //specific post view
          <PostPage postObj={postObj} />
        }
      </div>
    </div>
  );
}
