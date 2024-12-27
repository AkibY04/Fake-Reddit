// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.jsx'
import { AppContext } from './components/AppContext.jsx';
import React, { useState } from 'react';
import axios from 'axios';

var communities = await axios.get("http://localhost:8000/communities")
var posts = await axios.get("http://localhost:8000/posts")
var comments = await axios.get("http://localhost:8000/comments")
var linkFlairs = await axios.get("http://localhost:8000/linkFlairs")
var accounts = await axios.get("http://localhost:8000/accounts")

function App() {

  const [selectedButton, setSelectedButton] = useState("Home");
  const [currFilteredPosts, setCurrFilteredPosts] = useState([])
  const [currSearchQuery, setCurrSearchQuery] = useState("")
  const [currSelectedCommunity, setCurrSelectedCommunity] = useState({})
  const [currCommunities, setCurrCommunities] = useState(Array.from(communities.data))
  const [currPosts, setCurrPosts] = useState(Array.from(posts.data))
  const [currFlairs, setCurrFlairs] = useState(Array.from(linkFlairs.data))
  const [currComments, setCurrComments] = useState(Array.from(comments.data))
  const [currAccounts, setCurrAccounts] = useState(Array.from(accounts))
  const [currCommentTarget, setCurrCommentTarget] = useState("")
  const [homeView, setHomeView] = useState("")
  const [currPostTarget, setCurrPostTarget]= useState("")
  const [currAccount, setCurrAccount]= useState("")
  const [currAccountStatus, setCurrAccountStatus]= useState("")
  const [currObjectBeingEdited, setCurrObjectBeingEdited] = useState("")

  return (
    <AppContext.Provider value={
      { selectedButton, setSelectedButton, 
        currFilteredPosts, setCurrFilteredPosts,
        currSearchQuery, setCurrSearchQuery,
        currSelectedCommunity, setCurrSelectedCommunity,
        currCommunities, setCurrCommunities, 
        currPosts, setCurrPosts,
        currFlairs, setCurrFlairs,
        currComments, setCurrComments,
        currCommentTarget, setCurrCommentTarget,
        homeView, setHomeView,
        currPostTarget, setCurrPostTarget,
        currAccount, setCurrAccount,
        currAccountStatus, setCurrAccountStatus,
        currAccounts, setCurrAccounts,
        currObjectBeingEdited, setCurrObjectBeingEdited
      }
      }>
      <section className="phreddit">
        <Phreddit />
      </section>
    </AppContext.Provider>
  );
}

export default App;