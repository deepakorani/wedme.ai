import React, { useState } from 'react';
import styles from './GenerateCards.module.css';

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
      <h3>Generate Cards</h3>
      <div className={styles.filterContainer}>
        {stage === 'select_event' && (
          <>
            <label className={styles.label}>
              Event Type:
              <select className={styles.select} value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="">Select Event Type</option>
                <option value="Engagement Party">Engagement Party</option>
                <option value="Bridal Shower">Bridal Shower</option>
                <option value="Wedding Ceremony">Wedding Ceremony</option>
              </select>
            </label>
            <label className={styles.label}>
              Theme:
              <select className={styles.select} value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="">Select Theme</option>
                <option value="modern">Modern</option>
                <option value="traditional">Traditional</option>
                <option value="vintage">Vintage</option>
              </select>
            </label>
            <label className={styles.label}>
              Couple's Name:
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="Enter couple's name"
              />
            </label>
            <label className={styles.label}>
              Event Location:
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Enter event location"
              />
            </label>
            <label className={styles.label}>
              Event Date:
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Enter event date"
              />
            </label>
            <button className={styles.button} onClick={handleSelectEvent}>Finalize Instructions for the Event</button>
          </>
        )}
        {stage === 'add_instructions' && (
          <div className="input-container">
            <input type="text" placeholder="Enter any additional instructions..." onKeyDown={handleUserInput} />
          </div>
        )}
        {stage === 'add_photo' && (
          <div className="input-container">
            <input type="text" placeholder="Enter optional photo URL or press Enter to skip..." onKeyDown={handleUserInput} />
          </div>
        )}
      </div>
      {stage !== 'select_event' && (
        <div className={styles.chatbox}>
          {messages.map((msg, index) => (
            <p key={index} className={msg.sender === 'ai' ? styles.aiMessage : styles.userMessage}>
              {msg.text}
            </p>
          ))}
          {imageUrl && (
            <div className="generated-image">
              <h4>Generated Image:</h4>
              <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateCards;
