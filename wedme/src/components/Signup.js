import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Signup = ({ onSignup }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("Attempting to sign up with email:", email);
    try {
      const response = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup successful, received token:", data.token);
        onSignup(data.token, username);
        navigate('/');
      } else {
        console.error('Signup failed', response.statusText);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={3} bgcolor="white" borderRadius={5} boxShadow={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signup
        </Typography>
        <form onSubmit={handleSignup}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Box mt={3}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Signup
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Signup;
