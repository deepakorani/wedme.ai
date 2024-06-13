import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import GenerateCards from './components/GenerateCards';
import Signup from './components/Signup';
import Login from './components/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("App Component Mounted");
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    console.log("Login Successful, Token:", token);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    console.log("Logging Out");
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="logo">
          <h1>Wedme.ai</h1>
        </div>
        <nav className="nav">
          <button className="nav-item new-chat">New Chat</button>
          <button className="nav-item">Chat with Document</button>
          <button className="nav-item">Generate Venues</button>
          <button className="nav-item" onClick={() => setSelectedFeature('generateCards')}>Generate Cards</button>
          <button className="nav-item">Chat History</button>
        </nav>
        <div className="signup">
          {isAuthenticated ? (
            <button className="signup-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="signup-btn" onClick={() => navigate('/signup')}>Sign up / Log in</button>
          )}
        </div>
      </aside>
      <main className="main-content">
        <header className="header">
          <h2>Your Personal Wedding Workspace</h2>
        </header>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={isAuthenticated ? (
            <>
              <section className="chat-with-doc">
                <h3>Chat with Document</h3>
                <div className="upload-area">
                  <div className="upload-box">
                    <span className="upload-text">Click to Upload or Drop PDF/DOC here</span>
                    <button className="upload-btn">Upload Files</button>
                    <a href="#" className="upload-url">From URL</a>
                  </div>
                </div>
              </section>
              <section className="ai-tools">
                <div className="ai-presentation">
                  <h3>AI Presentation</h3>
                  <button className="tool-btn">Enter topic</button>
                  <button className="tool-btn">Enhance file</button>
                </div>
                <div className="ai-image">
                  <h3>AI Image</h3>
                  <button className="tool-btn">View templates</button>
                </div>
              </section>
              {selectedFeature === 'generateCards' && <GenerateCards />}
            </>
          ) : (
            <Navigate to="/login" />
          )} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
