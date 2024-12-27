import React from 'react'
import '../css/index.css';
import {matchesSearchTerms, searchComments} from "./helpers"
import { useContext } from 'react';
import { AppContext } from './AppContext.jsx'

export default function Banner({ refresher, changeView }) {
    const { currAccountStatus, setCurrAccountStatus, setCurrAccount, currComments, setHomeView, currPosts, setCurrFilteredPosts, setCurrSearchQuery, setSelectedButton, setCurrSelectedCommunity, selectedButton } = useContext(AppContext);

    function handleClick() {
        refresher();
        setSelectedButton("Home")
        setHomeView("");
        setCurrFilteredPosts([])
        setCurrSearchQuery("")
        setCurrSelectedCommunity({})
    }

    const postsArr = currPosts;

    const handleSearch = (event) => {

        if (event.key === "Enter") {

            let currFilteredPosts = []

            let input = event.target.value

            const searchTerms = input.split(" ").map(word => word.toLowerCase());

            postsArr.forEach(post => {
                const postContent = post.title.toLowerCase() + post.content.toLowerCase(); 
            
                const searchedPostFound = matchesSearchTerms(searchTerms, postContent);
                const searchedCommentsFound = searchComments(searchTerms, post.commentIDs, currComments);
            
                if (searchedPostFound || searchedCommentsFound) {
                    currFilteredPosts.push(post);
                }
            });

            setCurrFilteredPosts(currFilteredPosts)
            setCurrSearchQuery(input)
            setCurrSelectedCommunity({})
            setHomeView("");

            setSelectedButton("search-page")
        }

    }

    function handleCreatePost() {
        if(currAccountStatus !== "Guest"){
            setSelectedButton("create-post-button")
        }
    }

    function handleLogoutButton() {
        handleClick();

        setCurrAccount("");
        setCurrAccountStatus("");
        changeView("Welcome");
        // setSelectedButton("logout-button")

        document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "userType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    }

    function handleUserProfileButton() {
        if(currAccountStatus !== "Guest"){
            setSelectedButton("user-profile-button")
        }
    }

    return (
        <div id="banner">
          <div className="home-link" id="logo">
            <a 
              href="/#home" 
              onClick={(event) => {
                event.preventDefault(); 
                if (currAccountStatus === "Guest") {
                  handleLogoutButton();
                } else {
                  handleClick();
                }
              }} 
              style={{ textDecoration: 'none' }}
            >
              phreddit
            </a>
          </div>
    
          <div id="searchbar">
            <input
              type="text"
              id="search-input"
              autoComplete="off"
              placeholder="Search Phreddit..."
              onKeyDown={handleSearch}
            />
          </div>
    
          <div id="createpost">
            <button
              id="create-post-button"
              style={{
                backgroundColor: currAccountStatus === "Guest" ? 'gray' : (selectedButton === "create-post-button" ? '#FF5700' : 'lightgray'),
                cursor: currAccountStatus === "Guest" ? 'not-allowed' : 'pointer'
              }}

              onClick={handleCreatePost}

              onMouseEnter={(button) => {
                if (currAccountStatus !== "Guest" && selectedButton !== "create-post-button") {
                  button.currentTarget.style.backgroundColor = '#FF5700'; 
                }
              }}

              onMouseLeave={(button) => {
                if (currAccountStatus !== "Guest" && selectedButton !== "create-post-button") {
                  button.currentTarget.style.backgroundColor = 'lightgray'; 
                } else if (currAccountStatus !== "Guest") {
                  button.currentTarget.style.backgroundColor = '#FF5700';
                }
              }}
            >
              Create Post
            </button>
          </div>
    
          <div id="user-profile">
            <button
              id="user-profile-button"
              style={{
                backgroundColor: selectedButton === "user-profile-button" ? '#FF5700' : 'lightgray',
                cursor: currAccountStatus === "Guest" ? 'not-allowed' : 'pointer'
              }}

              onClick={handleUserProfileButton}

              onMouseEnter={(button) => {
                if (currAccountStatus !== "Guest" && selectedButton !== "user-profile-button") {
                  button.currentTarget.style.backgroundColor = '#FF5700'; 
                }
              }}

              onMouseLeave={(button) => {
                if (currAccountStatus !== "Guest" && selectedButton !== "user-profile-button") {
                  button.currentTarget.style.backgroundColor = 'lightgray'; 
                } else if (selectedButton === "user-profile-button") {
                  button.currentTarget.style.backgroundColor = '#FF5700';
                }
              }}
            >
              {currAccountStatus === "Guest" ? "Guest" : "User Profile"}
            </button>
          </div>
    
          {currAccountStatus !== "Guest" && (
            <div id="logout">
              <button
                id="logout-button"
                style={{
                  backgroundColor: selectedButton === "logout-button" ? '#FF5700' : 'lightgray'
                }}

                onClick={() => handleLogoutButton()}

                onMouseEnter={(button) => {
                  if (selectedButton !== "logout-button") {
                    button.currentTarget.style.backgroundColor = '#FF5700'; 
                  }
                }}

                onMouseLeave={(button) => {
                  if (selectedButton !== "logout-button") {
                    button.currentTarget.style.backgroundColor = 'lightgray'; 
                  } else {
                    button.currentTarget.style.backgroundColor = '#FF5700'; 
                  }
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      );
    }