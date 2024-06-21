import React, { useState } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: 'AI: How can I help you with your card generation today?', sender: 'ai' }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (userInput.trim()) {
      const newMessages = [...messages, { text: userInput, sender: 'user' }];
      setMessages(newMessages);
      setUserInput('');

      try {
        const response = await fetch(process.env.REACT_APP_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }),
        });

        const data = await response.json();
        setMessages([...newMessages, { text: data.message, sender: 'ai' }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages([...newMessages, { text: 'AI: Sorry, there was an error processing your request.', sender: 'ai' }]);
      }
    }
  };

  return (
    <div className="chat-interface">
      <h3>Chat with AI to Generate Cards</h3>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === 'ai' ? 'ai-message' : 'user-message'}>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
