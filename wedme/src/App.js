import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { FaUsers, FaBuilding, FaClipboard, FaUtensils, FaHistory } from 'react-icons/fa';
import GenerateDesign from './components/GenerateDesigns/GenerateDesign';
import GenerateCards from './components/GenerateCards/GenerateCards';
import GenerateMenu from './components/GenerateMenu/GenerateMenu';
import Signup from './components/Signup';
import Login from './components/Login';
import GenerateVendors from './components/GenerateVendors/GenerateVendors';

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
          <button className="nav-item" onClick={() => setSelectedFeature('generateVendors')}>
            <FaUsers className="nav-icon" /> Generate Vendors
          </button>
          <button className="nav-item" onClick={() => setSelectedFeature('generateDesign')}>
            <FaBuilding className="nav-icon" /> Generate Venue Designs
          </button>
          <button className="nav-item" onClick={() => setSelectedFeature('generateCards')}>
            <FaClipboard className="nav-icon" /> Generate Cards
          </button>
          <button className="nav-item" onClick={() => setSelectedFeature('generateMenu')}>
            <FaUtensils className="nav-icon" /> Generate Catering Menu
          </button>
          <button className="nav-item">
            <FaHistory className="nav-icon" /> Chat History
          </button>
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
              {selectedFeature === 'generateVendors' && <GenerateVendors />}
              {selectedFeature === 'generateCards' && <GenerateCards />}
              {selectedFeature === 'generateDesign' && <GenerateDesign />}
              {selectedFeature === 'generateMenu' && <GenerateMenu />}
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
