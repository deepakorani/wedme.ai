import React, { useState } from 'react';
import styles from './GenerateDesigns.module.css';  

const GenerateDesign = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [messages, setMessages] = useState([
    { text: 'AI: How can I help you with your venue design generation today?', sender: 'ai' }
  ]);

  const handleGenerateDesign = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (data.image_url) {
        setMessages([...messages, { text: 'Design generated successfully!', sender: 'ai' }]);
        setImageUrl(data.image_url);
      } else {
        setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
    }
  };

  const handleUserInput = (e) => {
    if (e.key === 'Enter') {
      const input = e.target.value;
      e.target.value = '';
      setDescription(input);
      handleGenerateDesign();
    }
  };

  return (
    <div className={styles.generateDesign}>
      <h3 className={styles.title}>Generate Venue Designs</h3>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter the venue design description..Ex: mandap design for an outdoor beach wedding"
          onKeyDown={handleUserInput}
        />
      </div>
      <div className={styles.chatbox}>
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === 'ai' ? styles.aiMessage : styles.userMessage}>
            {msg.text}
          </p>
        ))}
        {imageUrl && (
          <div className={styles.generatedImage}>
            <h4>Generated Image:</h4>
            <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateDesign;
