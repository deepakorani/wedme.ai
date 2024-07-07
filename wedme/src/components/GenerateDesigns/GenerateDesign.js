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
  CardMedia
} from '@mui/material';
import { FaDownload } from 'react-icons/fa';
import { SaveAlt as SaveAltIcon } from '@mui/icons-material';

const GenerateDesign = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [messages, setMessages] = useState([
    { text: 'AI: How can I help you with your venue design generation today?', sender: 'ai' }
  ]);

  const handleGenerateDesign = async () => {
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
        setMessages([...messages, { text: 'Design generated successfully!', sender: 'ai' }]);
        setImageUrl(data.image_url);
      } else {
        setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([...messages, { text: 'AI: Sorry, there was an error generating the design.', sender: 'ai' }]);
    }
  };

  const handleUserInput = (e) => {
    if (e.key === 'Enter') {
      const input = e.target.value;
      e.target.value = '';
      setDescription(input);
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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Generate Venue Designs
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter the venue design description..Ex: mandap design for an outdoor beach wedding"
        onKeyDown={handleUserInput}
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
    </Container>
  );
};

export default GenerateDesign;
