import React, { useState } from 'react';
import styles from './VendorManagement.module.css';

const VendorManagement = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState([]);

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
        const venueDetails = data.response.split('\n').map(venue => {
          const parts = venue.split(' - ');
          return { name: parts[0], description: parts[1] };
        });
        setResponse(venueDetails);
      } else {
        setResponse([{ name: 'Error', description: data.error }]);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse([{ name: 'Error', description: 'Failed to fetch' }]);
    });
  };

  return (
    <div className={styles.container}>
      <h1>Venue Prompts!</h1>
      <textarea
        className={styles.input}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows="4"
        cols="50"
      ></textarea><br />
      <button className={styles.button} onClick={sendPrompt}>Generate</button>
      {response.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Venue</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {response.map((venue, index) => (
              <tr key={index}>
                <td>{venue.name}</td>
                <td>{venue.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VendorManagement;
