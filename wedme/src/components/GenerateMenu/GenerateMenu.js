import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { FaUtensils, FaListAlt, FaCarrot, FaIceCream } from 'react-icons/fa';
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
    <Container>
      <Typography variant="h4" gutterBottom>
        Menu Generator
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cuisine"
            variant="outlined"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            InputProps={{
              startAdornment: <FaUtensils />,
            }}
            helperText="Enter the type of cuisine you want, e.g., Italian, Indian"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Number of Entrees"
            variant="outlined"
            value={numEntrees}
            onChange={(e) => setNumEntrees(e.target.value)}
            InputProps={{
              startAdornment: <FaListAlt />,
            }}
            helperText="Enter the number of main course dishes"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Number of Appetizers"
            variant="outlined"
            value={numAppetizers}
            onChange={(e) => setNumAppetizers(e.target.value)}
            InputProps={{
              startAdornment: <FaCarrot />,
            }}
            helperText="Enter the number of appetizer dishes"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Number of Desserts"
            variant="outlined"
            value={numDesserts}
            onChange={(e) => setNumDesserts(e.target.value)}
            InputProps={{
              startAdornment: <FaIceCream />,
            }}
            helperText="Enter the number of dessert dishes"
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={sendPrompt}
        disabled={loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? 'Loading...' : 'Generate Menu'}
      </Button>
      {response.error && <Typography color="error">{response.error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {response.entrees.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5">Entrees</Typography>
                <ul>
                  {response.entrees.map((entree, index) => (
                    <li key={index}>{entree}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        )}
        {response.appetizers.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5">Appetizers</Typography>
                <ul>
                  {response.appetizers.map((appetizer, index) => (
                    <li key={index}>{appetizer}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        )}
        {response.desserts.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h5">Desserts</Typography>
                <ul>
                  {response.desserts.map((dessert, index) => (
                    <li key={index}>{dessert}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default GenerateMenu;
