import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  // Store the user object (contains userId and profile)
  const [user, setUser] = useState(null);

  // This handles the data returned from your revised Login.jsx fetch call
  const handleLoginSuccess = (userId, profile) => {
    setUser({ userId, profile });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {!user ? (
        // Pass the login handler to the Login component
        <Login onLogin={handleLoginSuccess} />
      ) : (
        // Pass the user data and logout function to the Dashboard
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;