import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Alert
} from '@mui/material';
import { FaDownload } from 'react-icons/fa';
import { SaveAlt as SaveAltIcon } from '@mui/icons-material';

const GenerateDesign = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [messages, setMessages] = useState([
    { text: 'AI: How can I help you with your venue design generation today?', sender: 'ai' }
  ]);
  const [errorOccurred, setErrorOccurred] = useState(false); // Track if an error has occurred
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state

  const handleGenerateDesign = async () => {
    if (!description.trim()) {
      if (!errorOccurred) { // Only add the error message once
        setMessages([...messages, { text: 'AI: Description cannot be empty.', sender: 'ai' }]);
        setErrorOccurred(true); // Set error flag
      }
      return;
    }

    setErrorOccurred(false); // Reset error flag before making the request

    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (data.image_url) {
        setMessages([...messages, { text: `AI: Generate a design for ${description}.`, sender: 'ai' }]);
        setImageUrl(data.image_url);
        setOpenSnackbar(true); // Open the snackbar on success
        setMessages(prevMessages => [...prevMessages, { text: 'AI: Design generated successfully! What would you like to add next?', sender: 'ai' }]);
      } else {
        setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
        setErrorOccurred(true); // Set error flag
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
      setErrorOccurred(true); // Set error flag
    }
  };

  const handleUserInput = (e) => {
    setDescription(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerateDesign();
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-design.png'; // or 'generated-design.jpg'
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Generate Venue Designs
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter the venue design description..Ex: mandap design for an outdoor beach wedding"
        value={description}
        onChange={handleUserInput}
        onKeyDown={handleKeyDown}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleGenerateDesign} edge="end">
                <SaveAltIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      <Box sx={{ mb: 3 }}>
        {messages.map((msg, index) => (
          <Typography
            key={index}
            variant="body1"
            sx={{
              backgroundColor: msg.sender === 'ai' ? '#d0eaff' : '#e1ffe0',
              p: 2,
              borderRadius: 2,
              mb: 1,
              textAlign: msg.sender === 'ai' ? 'left' : 'right',
            }}
          >
            {msg.text}
          </Typography>
        ))}
      </Box>
      {imageUrl && (
        <Card>
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Generated"
            sx={{ maxWidth: '100%', height: 'auto' }}
          />
          <CardContent sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaDownload />}
              onClick={() => handleDownload(imageUrl)}
            >
              Download
            </Button>
          </CardContent>
        </Card>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Design generated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GenerateDesign;

