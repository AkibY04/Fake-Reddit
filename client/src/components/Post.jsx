// src/Post.jsx
import React from 'react';
import '../css/index.css';
import { timestamp, countPostComments } from './helpers';
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx';
import axios from 'axios'; 


export default function Post({ postObj, communities, linkFlairs, setHomeView, showCommunity = true }) {
  const { currComments, setSelectedButton } = useContext(AppContext);

  const community = communities.find(community => community.postIDs?.includes(postObj._id));
  //console.log(communities)
  const communityName = community?.name;

  let flairContents = "";
  if (postObj.linkFlairID) {
    const flair = linkFlairs.find(f => f._id.toString() === postObj.linkFlairID);
    if (flair) {
      flairContents = <span className="post-flair">{flair.content}</span>;
    }
  }

  let postContent = postObj.content
  if (postContent.length > 80) {
    postContent = postContent.slice(0,80) + "...";
  }

  const commentCount = countPostComments(currComments, postObj);

  const handlePostView = async () => {
    try {
      await axios.put(`http://localhost:8000/posts/update/${postObj._id}`, {
        views: 1,
      });

      postObj.views++;

      setHomeView(postObj._id);
      setSelectedButton("None");
    } catch (err) {
      console.error("Failed to update views:", err);
    }
  };

  return (
    <div className="post">
        <span>
        <i>{showCommunity ? communityName + " | " : null}</i> {postObj.postedBy} | {timestamp(postObj.postedDate)}
        </span>
        <br />
        <hr />
        <div className="post-sub-header">
        <div className="post-sub-header-left">
            <a href={`/#${postObj.title}`} className="post-title"
            onClick={handlePostView}
            >{postObj.title}</a>
        </div>
        </div>
        <div className="post-sub-header-right">
            {flairContents}
        </div>
        <p>{postContent}</p>
        <div className="post-footer">
        <span>{postObj.views} views | {commentCount} comment(s) | Upvotes: {postObj.upvotes}</span>
      </div>
      <div className="dotted-line"></div>

    </div>
  );
}