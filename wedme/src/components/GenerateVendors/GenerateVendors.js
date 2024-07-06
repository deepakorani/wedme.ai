import React, { useState } from 'react';
import styles from './GenerateVendors.module.css';

const GenerateVendors = () => {
  const [vendorType, setVendorType] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [response, setResponse] = useState({ vendors: [], error: '' });

  const sendPrompt = () => {
    fetch('http://127.0.0.1:5000/generatevendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendorType, budget, location })
    })
    .then(response => response.json())
    .then(data => {
      if (data.response) {
        setResponse({ vendors: data.response, error: '' });
      } else {
        setResponse({ vendors: [], error: data.error });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ vendors: [], error: 'Failed to fetch' });
    });
  };

  return (
    <div className={styles.container}>
      <h1>Generate Vendors</h1>
      <div className={styles.form}>
        <label className={styles.label}>
          Vendor Type:
          <input
            type="text"
            value={vendorType}
            onChange={e => setVendorType(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Budget:
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Location:
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className={styles.input}
          />
        </label>
        <button className={styles.button} onClick={sendPrompt}>Generate</button>
      </div>
      {response.error && <p>{response.error}</p>}
      <div>
        {Array.isArray(response.vendors) && response.vendors.length > 0 && (
          <div>
            <h2>Vendors</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {response.vendors.map((vendor, index) => (
                  <tr key={index}>
                    <td>{vendor.name}</td>
                    <td>{vendor.description}</td>
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

export default GenerateVendors;
