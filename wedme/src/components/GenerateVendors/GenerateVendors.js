import React, { useState } from 'react';
import { Form, Input, Button, Table, Typography, Tooltip, Spin, message } from 'antd';
import { FaIndustry, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './GenerateVendors.module.css';

const { Title, Text } = Typography;

const GenerateVendors = () => {
  const [vendorType, setVendorType] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [response, setResponse] = useState({ vendors: [], error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!vendorType || !budget || !location) {
      setResponse({ vendors: [], error: 'All fields are required', success: '' });
      return false;
    }
    if (isNaN(budget) || budget <= 0) {
      setResponse({ vendors: [], error: 'Budget must be a positive number', success: '' });
      return false;
    }
    return true;
  };

  const sendPrompt = () => {
    if (!validateInputs()) return;

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
        message.success('Vendors generated successfully!');
      } else {
        setResponse({ vendors: [], error: data.error || 'An error occurred', success: '' });
        message.error(data.error || 'An error occurred');
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ vendors: [], error: 'Failed to fetch data from the server', success: '' });
      message.error('Failed to fetch data from the server');
      setLoading(false);
    });
  };

  const columns = [
    {
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    }
  ];

  return (
    <div className={styles.container}>
      <Title level={2}>Generate Vendors</Title>
      <div className={styles.filterContainer}>
      <Form
        layout="vertical"
        onFinish={sendPrompt}
        className={styles.form}
      >
        <Form.Item
          label={<span><FaIndustry /> Vendor Type <Tooltip title="Enter the type of vendor you need, e.g., DJ, Catering"><Text underline>?</Text></Tooltip></span>}
          name="vendorType"
          rules={[{ required: true, message: 'Please enter the vendor type!' }]}
        >
          <Input
            value={vendorType}
            onChange={e => setVendorType(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label={<span><FaDollarSign /> Budget <Tooltip title="Enter your budget for the vendor"><Text underline>?</Text></Tooltip></span>}
          name="budget"
          rules={[{ required: true, message: 'Please enter your budget!' }, { type: 'number', min: 1, message: 'Budget must be a positive number!' }]}
        >
          <Input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label={<span><FaMapMarkerAlt /> Location <Tooltip title="Enter the location where you need the vendor"><Text underline>?</Text></Tooltip></span>}
          name="location"
          rules={[{ required: true, message: 'Please enter the location!' }]}
        >
          <Input
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button className={styles.generateVendorsButton} htmlType="submit" disabled={loading}>
            {loading ? <Spin /> : 'Generate Vendors'}
          </Button>
        </Form.Item>
      </Form>
      {response.error && <Text type="danger">{response.error}</Text>}
      {response.success && <Text type="success">{response.success}</Text>}
      {Array.isArray(response.vendors) && response.vendors.length > 0 && (
        <div className={styles.results}>
          <Title level={3}>Vendors</Title>
          <Table dataSource={response.vendors} columns={columns} rowKey="name" />
        </div>
      )}
      </div>
    </div>
  );
};

export default GenerateVendors;
