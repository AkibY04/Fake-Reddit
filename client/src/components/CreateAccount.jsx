import React, { useState } from 'react';
import '../css/index.css';
import axios from 'axios'

export default function CreateAccount({ changeView }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email format provided');
      return
    }

    for (let substring of [firstName, lastName, displayName, email]) {
      if (password.toLowerCase().includes(substring.toLowerCase())) {
        setErrorMessage('Insecure password');
      return
      }
    }

    try {

      var name = firstName + " " + lastName

      await axios.post("http://localhost:8000/accounts/create", {
        name,
        email,
        displayName, 
        password,
        confirmPassword
      });
      
      alert('Account created successfully! Sign in with your new account in the Welcome Page!');

      changeView("Welcome");
      setFirstName('')
      setLastName('')
      setEmail('')
      setDisplayName('')
      setPassword('')
      setConfirmPassword('')
      setErrorMessage('')

    } catch (error) {

      if ((password !== confirmPassword)) {
        setErrorMessage('Passwords must match')
      }
  
      if (error.response && error.response.data) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }

      setFirstName('')
      setLastName('')
      setEmail('')
      setDisplayName('')
      setPassword('')
      setConfirmPassword('')
      setErrorMessage('')
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

      <h2 style={{ color: '#FF5700' }}>Create Account</h2>
      <form className="create-account-form">
        <label>First Name:
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </label>
        <label>Last Name: 
        <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </label>
        <label>Email:
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>Display Name:
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <label>Password:
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="signup-button" onClick={handleSubmit}>Sign Up</button>
      </form>
    </div>
  );
}
