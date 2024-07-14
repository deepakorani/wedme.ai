import React, { useState } from 'react';
import { Input, Typography, Card, Row, Col, message } from 'antd';
import styles from './GenerateDesigns.module.css';

const { Title } = Typography;

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
      message.error('There was an error generating the design.');
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
      <Title level={2} className={styles.title}>Generate Venue Designs</Title>
      <div className={styles.inputContainer}>
        <Input
          className={styles.input}
          placeholder="Enter the venue design description..Ex: mandap design for an outdoor beach wedding"
          onPressEnter={handleUserInput}
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
            <Title level={4}>Generated Image:</Title>
            <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateDesign;
