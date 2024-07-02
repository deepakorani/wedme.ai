import React, { useState } from 'react';
import styles from './GenerateMenu.module.css';

const GenerateMenu = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState({ desserts: [], appetizers: [], entrees: [], error: '' });

  const sendPrompt = () => {
    fetch('http://127.0.0.1:5000/generatemenu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
    .then(response => response.json())
    .then(data => {
      if (data.response) {
        const menuItems = parseMenuResponse(data.response);
        setResponse(menuItems);
      } else {
        setResponse({ desserts: [], appetizers: [], entrees: [], error: data.error });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ desserts: [], appetizers: [], entrees: [], error: 'Failed to fetch' });
    });
  };

  const parseMenuResponse = (response) => {
    const lines = response.split('\n');
    const menuItems = { desserts: [], appetizers: [], entrees: [], error: '' };
    let currentCategory = null;

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('dessert')) {
        currentCategory = 'desserts';
      } else if (lowerLine.includes('appetizer')) {
        currentCategory = 'appetizers';
      } else if (lowerLine.includes('entree') || lowerLine.includes('main course') || lowerLine.includes('dish')) {
        currentCategory = 'entrees';
      } else if (currentCategory) {
        menuItems[currentCategory].push(line.trim());
      }
    });

    return menuItems;
  };

  return (
    <div className={styles.container}>
      <h1>Menu Prompts!</h1>
      <textarea
        className={styles.input}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows="4"
        cols="50"
      ></textarea><br />
      <button className={styles.button} onClick={sendPrompt}>Generate</button>
      {response.error && <p>{response.error}</p>}
      <div>
        {response.desserts.length > 0 && (
          <div>
            <h2>Desserts</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Dessert</th>
                </tr>
              </thead>
              <tbody>
                {response.desserts.map((dessert, index) => (
                  <tr key={index}>
                    <td>{dessert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {response.appetizers.length > 0 && (
          <div>
            <h2>Appetizers</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Appetizer</th>
                </tr>
              </thead>
              <tbody>
                {response.appetizers.map((appetizer, index) => (
                  <tr key={index}>
                    <td>{appetizer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {response.entrees.length > 0 && (
          <div>
            <h2>Entrees</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Entree</th>
                </tr>
              </thead>
              <tbody>
                {response.entrees.map((entree, index) => (
                  <tr key={index}>
                    <td>{entree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateMenu;
