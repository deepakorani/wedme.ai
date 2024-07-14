import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, message } from 'antd';
import styles from './GenerateCards.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const GenerateCards = () => {
  const [eventType, setEventType] = useState('');
  const [theme, setTheme] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [stage, setStage] = useState('select_event');

  const handleSelectEvent = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/select_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType, theme, couple_name: coupleName, event_date: eventDate, event_location: eventLocation }),
      });

      const data = await response.json();
      setMessages([...messages, { text: `AI: Thank you for adding the event details: ${eventType}, ${theme}, ${coupleName}, ${eventDate}, ${eventLocation}. Would you like to provide any additional instructions for the card design?`, sender: 'ai' }]);
      setStage('add_instructions'); // Move to the add instructions stage
    } catch (error) {
      console.error('Error:', error);
      message.error('There was an error processing your request.');
      setMessages([...messages, { text: 'AI: Sorry, there was an error processing your request.', sender: 'ai' }]);
    }
  };

  const handleAddInstructions = (instructions) => {
    setMessages([...messages, { text: `User: ${instructions}`, sender: 'user' }, { text: 'AI: Thank you! Would you like to add an optional photo URL for the card?', sender: 'ai' }]);
    setStage('add_photo');
  };

  const handleAddPhoto = (photoUrl) => {
    setPhotoUrl(photoUrl);
    setMessages([...messages, { text: `User: ${photoUrl}`, sender: 'user' }, { text: 'AI: Thank you! Generating your card now.', sender: 'ai' }]);
    handleGenerateImage(photoUrl);
  };

  const handleGenerateImage = async (photoUrl = '') => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType, theme, couple_name: coupleName, event_date: eventDate, event_location: eventLocation, photo_url: photoUrl }),
      });

      const data = await response.json();
      if (data.image_url) {
        setMessages([...messages, { text: 'Image generated successfully!', sender: 'ai' }]);
        setImageUrl(data.image_url);
      } else {
        setMessages([...messages, { text: 'AI: Sorry, there was an error generating the image.', sender: 'ai' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('There was an error generating the image.');
      setMessages([...messages, { text: 'AI: Sorry, there was an error generating the image.', sender: 'ai' }]);
    }
  };

  const handleUserInput = (e) => {
    if (e.key === 'Enter' && stage === 'add_instructions') {
      const input = e.target.value;
      e.target.value = '';
      handleAddInstructions(input);
    } else if (e.key === 'Enter' && stage === 'add_photo') {
      const input = e.target.value;
      e.target.value = '';
      handleAddPhoto(input);
    }
  };

  return (
    <div className={styles.container}>
      <Title level={2}>Generate Cards</Title>
      <div className={styles.filterContainer}>
        {stage === 'select_event' && (
          <Form layout="vertical">
            <Form.Item label="Event Type">
              <Select value={eventType} onChange={setEventType} placeholder="Select Event Type">
                <Option value="Engagement Party">Engagement Party</Option>
                <Option value="Bridal Shower">Bridal Shower</Option>
                <Option value="Wedding Ceremony">Wedding Ceremony</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Theme">
              <Select value={theme} onChange={setTheme} placeholder="Select Theme">
                <Option value="modern">Modern</Option>
                <Option value="traditional">Traditional</Option>
                <Option value="vintage">Vintage</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Couple's Name">
              <Input
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="Enter couple's name"
              />
            </Form.Item>
            <Form.Item label="Event Location">
              <Input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Enter event location"
              />
            </Form.Item>
            <Form.Item label="Event Date">
              <Input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Enter event date"
              />
            </Form.Item>
            <Button className={styles.finalizeInstructions} onClick={handleSelectEvent}>Finalize Instructions for the Event</Button>
          </Form>
        )}
        {stage === 'add_instructions' && (
          <Input
            type="text"
            placeholder="Enter any additional instructions..."
            onKeyDown={handleUserInput}
          />
        )}
        {stage === 'add_photo' && (
          <Input
            type="text"
            placeholder="Enter optional photo URL or press Enter to skip..."
            onKeyDown={handleUserInput}
          />
        )}
      </div>
      {stage !== 'select_event' && (
        <div className={styles.chatbox}>
          {messages.map((msg, index) => (
            <Text key={index} className={msg.sender === 'ai' ? styles.aiMessage : styles.userMessage}>
              {msg.text}
            </Text>
          ))}
          {imageUrl && (
            <div className="generated-image">
              <Title level={4}>Generated Image:</Title>
              <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateCards;
