import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Box } from '@mui/material';
import { FaUsers, FaBuilding, FaUtensils, FaHistory, FaSignOutAlt, FaUser } from 'react-icons/fa';
import GenerateDesign from './components/GenerateDesigns/GenerateDesign';
import GenerateMenu from './components/GenerateMenu/GenerateMenu';
import Signup from './components/Signup';
import Login from './components/Login';
import GenerateVendors from './components/GenerateVendors/GenerateVendors';
import Workspace from './components/Workspace/Workspace';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Assuming username is stored in localStorage, adjust if stored elsewhere
      const user = localStorage.getItem('username');
      setUsername(user);
    }
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
    setIsAuthenticated(true);
    setUsername(user);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold', color: 'purple'}}>
            Wedme.ai
          </Typography>
          {isAuthenticated && (
            <Button color="inherit" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <div style={{ display: 'flex' }}>
        <Drawer variant="permanent" anchor="left">
          <List>
            <ListItem button onClick={() => navigate('/generate-vendors')}>
              <ListItemIcon><FaUsers /></ListItemIcon>
              <ListItemText primary="Generate Vendors" />
            </ListItem>
            <ListItem button onClick={() => navigate('/generate-designs')}>
              <ListItemIcon><FaBuilding /></ListItemIcon>
              <ListItemText primary="Generate Venue Designs" />
            </ListItem>
            <ListItem button onClick={() => navigate('/generate-menus')}>
              <ListItemIcon><FaUtensils /></ListItemIcon>
              <ListItemText primary="Generate Catering Menu" />
            </ListItem>
            <ListItem button onClick={() => navigate('/chat-history')}>
              <ListItemIcon><FaHistory /></ListItemIcon>
              <ListItemText primary="Chat History" />
            </ListItem>
          </List>
          {isAuthenticated && (
            <Box sx={{ mt: 'auto', p: 2, textAlign: 'center', color: 'purple' }}>
              <Button color="inherit" onClick={handleMenuClick} startIcon={<FaUser />}>
                {username}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleMenuClose}>About Me</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
          {!isAuthenticated && (
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button variant="contained" color="secondary" onClick={() => navigate('/signup')}>
                Sign up / Log in
              </Button>
            </Box>
          )}
        </Drawer>
        <main style={{ flexGrow: 1, padding: '20px' }}>
          <Routes>
            <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={isAuthenticated ? <Workspace /> : <Navigate to="/login" />} />
            <Route path="/generate-vendors" element={isAuthenticated ? <GenerateVendors /> : <Navigate to="/login" />} />
            <Route path="/generate-designs" element={isAuthenticated ? <GenerateDesign /> : <Navigate to="/login" />} />
            <Route path="/generate-menus" element={isAuthenticated ? <GenerateMenu /> : <Navigate to="/login" />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
