import React, { useState } from 'react';
import { FaUtensils, FaListAlt, FaCarrot, FaIceCream } from 'react-icons/fa';
import { Form, Input, Button, Typography, Spin, Tooltip, Row, Col } from 'antd';
import styles from './GenerateMenu.module.css';

const { Title } = Typography;

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
      {/* <Row gutter={16}> */}
        {/* <Col xs={24} lg={8}> */}
          {/* <div className={styles.formContainer}> */}
            <Title level={2}>Menu Generator</Title>
            <Form layout="vertical">
              <Form.Item
                label={<span><FaUtensils /> Cuisine <Tooltip title="Enter the type of cuisine you want, e.g., Italian, Indian"><span className={styles.tooltipIcon}>?</span></Tooltip></span>}
              >
                <Input
                  value={cuisine}
                  onChange={e => setCuisine(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label={<span><FaListAlt /> Number of Entrees <Tooltip title="Enter the number of main course dishes"><span className={styles.tooltipIcon}>?</span></Tooltip></span>}
              >
                <Input
                  type="number"
                  value={numEntrees}
                  onChange={e => setNumEntrees(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label={<span><FaCarrot /> Number of Appetizers <Tooltip title="Enter the number of appetizer dishes"><span className={styles.tooltipIcon}>?</span></Tooltip></span>}
              >
                <Input
                  type="number"
                  value={numAppetizers}
                  onChange={e => setNumAppetizers(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label={<span><FaIceCream /> Number of Desserts <Tooltip title="Enter the number of dessert dishes"><span className={styles.tooltipIcon}>?</span></Tooltip></span>}
              >
                <Input
                  type="number"
                  value={numDesserts}
                  onChange={e => setNumDesserts(e.target.value)}
                />
              </Form.Item>
              <Button className={styles.generateMenu} onClick={sendPrompt} disabled={loading} block>
                {loading ? <Spin /> : 'Generate Menu'}
              </Button>
            </Form>
            {response.error && <p className={styles.error}>{response.error}</p>}
          {/* </div> */}
        {/* </Col> */}
        {/* <Col xs={24} lg={16}> */}
          <div className={styles.resultsContainer}>
            {response.entrees.length > 0 && (
              <div className={styles.card}>
                <Title level={3}>Entrees</Title>
                <ul className={styles.list}>
                  {response.entrees.map((entree, index) => (
                    <li key={index}>{entree}</li>
                  ))}
                </ul>
              </div>
            )}
            {response.appetizers.length > 0 && (
              <div className={styles.card}>
                <Title level={3}>Appetizers</Title>
                <ul className={styles.list}>
                  {response.appetizers.map((appetizer, index) => (
                    <li key={index}>{appetizer}</li>
                  ))}
                </ul>
              </div>
            )}
            {response.desserts.length > 0 && (
              <div className={styles.card}>
                <Title level={3}>Desserts</Title>
                <ul className={styles.list}>
                  {response.desserts.map((dessert, index) => (
                    <li key={index}>{dessert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        {/* </Col> */}
      {/* </Row> */}
    </div>
  );
};

export default GenerateMenu;
