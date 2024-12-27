import React, { useState, useContext } from 'react';
import '../css/index.css';
import axios from 'axios'
import { AppContext } from './AppContext.jsx'

export default function SignInPage({ changeView }) {
  const { setCurrAccountStatus, setCurrAccount } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email format provided');
      return
    }
  
    try {
      const response = await axios.post("http://localhost:8000/accounts/verify", {
        email,
        password,
      });
  
      const { account, userType } = response.data;
  
      alert("Log in successful");

      // cookie that lasts for 3 days w/ the account and another for usertype
      // encodeURIComponent ensures it is safe for storage
      document.cookie = `account=${encodeURIComponent(JSON.stringify(account))}; path=/; max-age=259200; secure; samesite=strict`;
      document.cookie = `userType=${userType}; path=/; max-age=259200; secure; samesite=strict`
  
      setCurrAccount(account);
      setCurrAccountStatus(userType);
      setEmail('');
      setPassword('');
      setErrorMessage('');
      changeView("Home");

    } catch (error) {
      
      if (error.response && error.response.data) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }
  
      setEmail('');
      setPassword('');
    }
  };
  

  return (
    <div className="create-account-container">
      <button
        onClick={() => changeView("Welcome")}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#FF5700',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
      >
        Go Back
      </button>

      <h2 style={{ color: '#FF5700' }}>Log In</h2>
      <form className="create-account-form">
        <label>Email:
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>Password:
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button onClick={handleSubmit} type="submit" className="signup-button">Log In</button>
      </form>
    </div>
  );
}
