import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';
import styles from './Login.module.css';

const { Title } = Typography;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    console.log("Attempting to log in with email:", email);
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful, received token:", data.token);
        onLogin(data.token, username);
        navigate('/');
      } else {
        console.error('Login failed', response.statusText);
        setError('Login failed: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login: ' + error.message);
    }
  };

  const handleSkipLogin = () => {
    const fakeToken = 'fake-jwt-token';
    const fakeUsername = 'testuser';
    onLogin(fakeToken, fakeUsername);
    navigate('/');
  };

  return (
    <div className={styles.login}>
      <Title level={2} className={styles.title}>Login</Title>
      <Form
        name="login"
        onFinish={handleLogin}
        className={styles.form}
      >
        {error && <Alert message={error} type="error" className={styles.alert} />}
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your Email!' }]}
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" className={styles.button}>Login</Button>
        </Form.Item>
      </Form>
      {process.env.NODE_ENV === 'development' && (
        <Button onClick={handleSkipLogin} className={styles.skipButton}>Skip Login</Button>
      )}
    </div>
  );
};

export default Login;
