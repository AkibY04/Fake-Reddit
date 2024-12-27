export default function WelcomePage({ changeView }) {
    return (
      <div className="welcome-container">
        <h1 className="welcome-title">Phreddit</h1>
        <div className="welcome-buttons">
          <button className="welcome-button" onClick={() => changeView("CreateAccount")}>
            Create Account
          </button>
          <button className="welcome-button" onClick={() => changeView("LogIn")}>
            Sign-in
          </button>
          <button className="welcome-button" onClick={() => changeView("Guest")}>
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }
  