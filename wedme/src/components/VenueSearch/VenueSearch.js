import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, CircularProgress, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './VenueSearch.module.css';

const VenueSearch = () => {
  const [query, setQuery] = useState('');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('Sending request with query:', query);
      const response = await axios.post('http://localhost:5000/api/searchvenues', 
        { query, top_k: 5 },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      console.log('Received response:', response.data);
      setVenues(response.data);
    } catch (error) {
      console.error('Error searching venues:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Error: ${error.message}`);
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container className={styles.container}>
      <Typography variant="h4" gutterBottom>Venue Search</Typography>
      <TextField
        label="Search Query"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchField}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        disabled={loading}
        className={styles.searchButton}
      >
        {loading ? <CircularProgress size={24} /> : 'Search'}
      </Button>

      <Box mt={4}>
        {venues.map((venue, index) => (
          <Box key={index} className={styles.venueBox}>
            <Typography variant="h6" className={styles.venueTitle}>{venue.name}</Typography>
            <Typography>Location: {venue.city}, {venue.state}</Typography>
            <Typography>Max Capacity: {venue.max_capacity}</Typography>
            <Typography>Starting Price: ${venue.starting_price}</Typography>
            <Typography>Relevance Score: {venue.score.toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        className={styles.snackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VenueSearch;
