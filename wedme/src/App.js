import React, { useState } from 'react';
import './App.css';
import GenerateCards from './components/GenerateCards';

const App = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

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
          <button className="signup-btn">Sign up / Log in</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="header">
          <h2>Your Personal Wedding Workspace</h2>
        </header>
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
      </main>
    </div>
  );
}

export default App;
