import React, { useState } from 'react';
import { FaUtensils, FaListAlt, FaCarrot, FaIceCream } from 'react-icons/fa';
import styles from './GenerateMenu.module.css';
import Tooltip from './Tooltip';

const GenerateMenu = () => {
  const [cuisine, setCuisine] = useState('');
  const [numEntrees, setNumEntrees] = useState('');
  const [numAppetizers, setNumAppetizers] = useState('');
  const [numDesserts, setNumDesserts] = useState('');
  const [response, setResponse] = useState({ desserts: [], appetizers: [], entrees: [], error: '' });
  const [loading, setLoading] = useState(false);

  const sendPrompt = () => {
    setLoading(true);
    fetch('http://127.0.0.1:5000/generatemenu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cuisine, numEntrees, numAppetizers, numDesserts })
    })
    .then(response => response.json())
    .then(data => {
      if (data.response) {
        const menuItems = parseMenuResponse(data.response);
        setResponse(menuItems);
      } else {
        setResponse({ desserts: [], appetizers: [], entrees: [], error: data.error });
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ desserts: [], appetizers: [], entrees: [], error: 'Failed to fetch' });
      setLoading(false);
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
      <div className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h1>Menu Generator</h1>
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}><FaUtensils /> Cuisine: <Tooltip text="Enter the type of cuisine you want, e.g., Italian, Indian" /></label>
              <input
                type="text"
                value={cuisine}
                onChange={e => setCuisine(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}><FaListAlt /> Number of Entrees: <Tooltip text="Enter the number of main course dishes" /></label>
              <input
                type="number"
                value={numEntrees}
                onChange={e => setNumEntrees(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}><FaCarrot /> Number of Appetizers: <Tooltip text="Enter the number of appetizer dishes" /></label>
              <input
                type="number"
                value={numAppetizers}
                onChange={e => setNumAppetizers(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}><FaIceCream /> Number of Desserts: <Tooltip text="Enter the number of dessert dishes" /></label>
              <input
                type="number"
                value={numDesserts}
                onChange={e => setNumDesserts(e.target.value)}
                className={styles.input}
              />
            </div>
            <button className={styles.button} onClick={sendPrompt} disabled={loading}>
              {loading ? 'Loading...' : 'Generate Menu'}
            </button>
          </div>
          {response.error && <p className={styles.error}>{response.error}</p>}
          {response.success && <p className={styles.success}>{response.success}</p>}
        </div>
        <div className={styles.resultsContainer}>
          {response.entrees.length > 0 && (
            <div className={styles.card}>
              <h2>Entrees</h2>
              <ul className={styles.list}>
                {response.entrees.map((entree, index) => (
                  <li key={index}>{entree}</li>
                ))}
              </ul>
            </div>
          )}
          {response.appetizers.length > 0 && (
            <div className={styles.card}>
              <h2>Appetizers</h2>
              <ul className={styles.list}>
                {response.appetizers.map((appetizer, index) => (
                  <li key={index}>{appetizer}</li>
                ))}
              </ul>
            </div>
          )}
          {response.desserts.length > 0 && (
            <div className={styles.card}>
              <h2>Desserts</h2>
              <ul className={styles.list}>
                {response.desserts.map((dessert, index) => (
                  <li key={index}>{dessert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateMenu;

