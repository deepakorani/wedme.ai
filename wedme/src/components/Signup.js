import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = ({ onSignup }) => {
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
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup successful, received token:", data.token);
        onSignup(data.token);
        navigate('/');
      } else {
        console.error('Signup failed', response.statusText);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className="signup">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
