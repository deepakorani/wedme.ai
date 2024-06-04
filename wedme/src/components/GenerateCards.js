import React, { useState } from 'react';

const GenerateCards = () => {
  const [eventType, setEventType] = useState('');
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [messages, setMessages] = useState([
    { text: 'AI: How can I help you with your card generation today?', sender: 'ai' }
  ]);
  const [imageUrl, setImageUrl] = useState(null);
  const [stage, setStage] = useState('select_event');

  const handleSelectEvent = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/select_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType, theme }),
      });

      const data = await response.json();
      setMessages([...messages, { text: data.message, sender: 'ai' }]);
      setStage('add_date'); // Move to the next stage
    } catch (error) {
      console.error('Error:', error);
      setMessages([...messages, { text: 'AI: Sorry, there was an error processing your request.', sender: 'ai' }]);
    }
  };

  const handleAddDate = async (date) => {
    setMessages([...messages, { text: `User: ${date}`, sender: 'user' }, { text: 'AI: Thank you! Now, do you have any additional information or instructions for the card?', sender: 'ai' }]);
    setStage('add_instructions');
  };

  const handleAddInstructions = async (instructions) => {
    setMessages([...messages, { text: `User: ${instructions}`, sender: 'user' }, { text: 'AI: Thank you! Generating your card now.', sender: 'ai' }]);
    setStage('generate_image');
  };

  const handleGenerateImage = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType, theme, photo_url: photoUrl }),
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
    if (e.key === 'Enter') {
      const input = e.target.value;
      e.target.value = '';
      if (stage === 'add_date') {
        handleAddDate(input);
      } else if (stage === 'add_instructions') {
        handleAddInstructions(input);
      }
    }
  };

  return (
    <div className="generate-cards">
      <h3>Generate Cards</h3>
      <div className="filter-container">
        {stage === 'select_event' && (
          <>
            <label>
              Event Type:
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="">Select Event Type</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
              </select>
            </label>
            <label>
              Theme:
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="">Select Theme</option>
                <option value="modern">Modern</option>
                <option value="traditional">Traditional</option>
                <option value="vintage">Vintage</option>
              </select>
            </label>
            <button className="start-chat-btn" onClick={handleSelectEvent}>Select Event</button>
          </>
        )}
        {stage === 'add_date' && (
          <div className="input-container">
            <input type="text" placeholder="Enter the event date..." onKeyDown={handleUserInput} />
          </div>
        )}
        {stage === 'add_instructions' && (
          <div className="input-container">
            <input type="text" placeholder="Enter any additional instructions..." onKeyDown={handleUserInput} />
          </div>
        )}
        {stage === 'generate_image' && (
          <>
            <label>
              Photo URL:
              <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Optional Photo URL" />
            </label>
            <button className="start-chat-btn" onClick={handleGenerateImage}>Generate Image</button>
          </>
        )}
      </div>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === 'ai' ? 'ai-message' : 'user-message'}>
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
    </div>
  );
};

export default GenerateCards;
