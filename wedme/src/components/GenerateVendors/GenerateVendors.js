import React, { useState } from 'react';
import { FaIndustry, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './GenerateVendors.module.css';
import Tooltip from './Tooltip';

const GenerateVendors = () => {
  const [vendorType, setVendorType] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [response, setResponse] = useState({ vendors: [], error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const sendPrompt = () => {
    setLoading(true);
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
        setResponse({ vendors: data.response, error: '', success: 'Vendors generated successfully!' });
      } else {
        setResponse({ vendors: [], error: data.error, success: '' });
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ vendors: [], error: 'Failed to fetch', success: '' });
      setLoading(false);
    });
  };

  return (
    <div className={styles.container}>
      <h1>Generate Vendors</h1>
      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}><FaIndustry /> Vendor Type: <Tooltip text="Enter the type of vendor you need, e.g., DJ, Catering" /></label>
          <input
            type="text"
            value={vendorType}
            onChange={e => setVendorType(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}><FaDollarSign /> Budget: <Tooltip text="Enter your budget for the vendor" /></label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}><FaMapMarkerAlt /> Location: <Tooltip text="Enter the location where you need the vendor" /></label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className={styles.input}
          />
        </div>
        <button className={styles.button} onClick={sendPrompt} disabled={loading}>
          {loading ? 'Loading...' : 'Generate Vendors'}
        </button>
      </div>
      {response.error && <p className={styles.error}>{response.error}</p>}
      {response.success && <p className={styles.success}>{response.success}</p>}
      <div>
        {Array.isArray(response.vendors) && response.vendors.length > 0 && (
          <div className={styles.results}>
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
