import React, { useState } from 'react';
import styles from './VendorManagement.module.css';

const VendorManagement = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const sendPrompt = () => {
    fetch('http://127.0.0.1:5000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
    .then(response => response.json())
    .then(data => {
      if (data.response) {
        setResponse('Response: ' + data.response);
      } else {
        setResponse('Error: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse('Error: Failed to fetch');
    });
  };

  return (
    <div className={styles.container}>
      <h1>Venue Prompts!
      </h1>
      <textarea
       className={styles.input}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows="4"
        cols="50"
      ></textarea><br />
      <button  className={styles.button} onClick={sendPrompt}>Generate</button>
      <p>{response}</p>
    </div>
  );
};

export default VendorManagement;
