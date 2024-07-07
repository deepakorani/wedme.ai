import React from 'react';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const templates = [
  {
    title: 'Generate Vendors',
    description: 'Create a list of vendors for your wedding with detailed information.',
    link: '/generate-vendors'
  },
  {
    title: 'Generate Designs',
    description: 'Get design ideas and concepts for your wedding venue.',
    link: '/generate-designs'
  },
  {
    title: 'Generate Menus',
    description: 'Plan your wedding menu with a variety of options.',
    link: '/generate-menus'
  }
];

const Workspace = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" gutterBottom>
          Wedme.ai - Your Personalized Wedding Workspace
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {templates.map((template, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {template.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {template.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(template.link)}
              >
                Go to {template.title}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Workspace;
