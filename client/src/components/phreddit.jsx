// phreddit.jsx
import '../css/index.css';
import Banner from "./Banner.jsx"
import NavBar from "./NavBar.jsx"
import HomePage from './MainPage.jsx';
import WelcomePage from './WelcomePage.jsx';
import CreateAccount from './CreateAccount.jsx';
import SignInPage from './SignInPage.jsx';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext.jsx'

function getCookies() {
  const cookies = document.cookie.split("; ");
  var accObj = null
  var userType = null
  var found = 0;
  for (let cookie of cookies) {
    const [key, val] = cookie.split("=")

    if (key === "account") {
      accObj = JSON.parse(decodeURIComponent(val))
      found += 1
    }

    if (key === "userType") {
      userType = val
      found += 1
    }
  }

  if (found === 2) {
    return [true, accObj, userType]
  }

  return [false, null, null]
}

export default function Phreddit() {
  const [currPageView, setCurrPageView] = useState("");
  const [refreshKey, setRefreshKey] = useState(false);
  
  const { setCurrAccountStatus, setCurrAccount } = useContext(AppContext);

  const refresh = () => {
    setRefreshKey((curr) => !curr); // trigger refresh
  };

  useEffect(() => {
    if (currPageView === "Guest") {
      setCurrAccountStatus("Guest");
    }
  }, [currPageView, setCurrAccountStatus]);

  useEffect(() => {
    const cookieInfo = getCookies();
    if (cookieInfo[0]) {  // Check if user is cached
      setCurrAccount(cookieInfo[1])
      setCurrAccountStatus(cookieInfo[2])
    }
  }, [setCurrAccount, setCurrAccountStatus]);
  
  const renderPage = () => {
    if (currPageView === "Welcome") {
      return <WelcomePage changeView={setCurrPageView} />;
    }
  
    if (currPageView === "CreateAccount") {
      return <CreateAccount changeView={setCurrPageView} />;
    }
  
    if (currPageView === "LogIn") {
      return <SignInPage changeView={setCurrPageView} />;
    }

    var cookieInfo = getCookies()
    if (cookieInfo[0]) { // if a user is cached
      return (
        <>
          <Banner refresher={refresh} changeView={setCurrPageView}/>
          <NavBar refresher={refresh} changeView={setCurrPageView}/>
          <HomePage key={refreshKey} changeView={setCurrPageView}/>
        </>
      );
    }
  
    if (currPageView === "Guest" || currPageView === "Home") {
      return (
        <>
          <Banner refresher={refresh} changeView={setCurrPageView}/>
          <NavBar refresher={refresh} changeView={setCurrPageView}/>
          <HomePage key={refreshKey} changeView={setCurrPageView}/>
        </>
      );
    }
  
    return <WelcomePage changeView={setCurrPageView} />;
  };

  return (
    <div className="phreddit-container">
      {renderPage()}
    </div>
  );
}