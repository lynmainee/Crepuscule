import React, { useState } from 'react';
import './Newspaper.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        onLogin(data.userId, data.profile); 
      } else {
        setMessage(data.message || "An error occurred during authentication.");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setMessage("Cannot connect to server. Ensure backend is running on port 5000.");
    }
  };

  return (
    <div className="newspaper-container">
      <header className="masthead">
        <div className="masthead-meta">
          <span>CRÉPUSCULE, A Cardinal Record of Dawn & Intuition</span>
          <span>EST. 2026</span>
        </div>
        <h1 className="headline-main">
          {isRegistering ? "Join the Circle" : "Align with the Tide"}
        </h1>
        <div className="nav-bar" style={{ justifyContent: 'center' }}>
          <span className="italic">
            {isRegistering 
              ? "Establish your credentials" 
              : "Please identify yourself to access Crépuscule"}
          </span>
        </div>
      </header>

      <main className="login-container">
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            {message && <div className="status-msg text-center italic mb-4">{message}</div>}
            
            <div className="login-field">
              <label>Username</label>
              <input 
                type="text" 
                autocomplete="off"
                className="login-input"
                autoComplete="new-password"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input 
                type="password" 
                className="login-input"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">
              {isRegistering ? "Register Profile" : "Enter Crépuscule"}
            </button>
            
            <button 
              type="button" 
              className="nav-btn" 
              style={{ fontSize: '0.9rem', marginTop: '10px' }}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage("");
              }}
            >
              {isRegistering ? "Already a member? Login here" : "No account? Register here"}
            </button>
          </form>
        </div>
      </main>

      <footer className="footer-bar" style={{ marginTop: 'auto' }}>
        <span>PRIVATE REFLECTIONS </span>
        <span>| A new dawn begins.</span>
      </footer>
    </div>
  );
};

export default Login;