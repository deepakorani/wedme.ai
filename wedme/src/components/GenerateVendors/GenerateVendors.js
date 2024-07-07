import React, { useState } from 'react';
import { FaIndustry, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import {
  Container, TextField, Button, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Tooltip, CircularProgress, Snackbar,
  Alert, IconButton, Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CSVLink } from 'react-csv';

const GenerateVendors = () => {
  const [vendorType, setVendorType] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [response, setResponse] = useState({ vendors: [], error: '', success: '' });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendPrompt = () => {
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
        setOpen(true);
      } else {
        setResponse({ vendors: [], error: data.error, success: '' });
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setResponse({ vendors: [], error: 'Failed to fetch', success: '' });
      setLoading(false);
    });
  };

  const headers = [
    { label: "Vendor Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "References", key: "reference" }
  ];

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Vendors
        </Typography>
        <Box component="form" display="flex" flexDirection="column" gap={3} mb={4}>
          <TextField
            label="Vendor Type"
            value={vendorType}
            onChange={e => setVendorType(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <Tooltip title="Enter the type of vendor you need, e.g., DJ, Catering">
                  <FaIndustry />
                </Tooltip>
              )
            }}
          />
          <TextField
            label="Budget"
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <Tooltip title="Enter your budget for the vendor">
                  <FaDollarSign />
                </Tooltip>
              )
            }}
          />
          <TextField
            label="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <Tooltip title="Enter the location where you need the vendor">
                  <FaMapMarkerAlt />
                </Tooltip>
              )
            }}
          />
          <Box textAlign="right">
            <Button variant="contained" color="primary" onClick={sendPrompt} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Vendors'}
            </Button>
          </Box>
        </Box>
        <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
          <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
            Vendors generated successfully!
          </Alert>
        </Snackbar>
        {response.error && <Typography color="error">{response.error}</Typography>}
        {Array.isArray(response.vendors) && response.vendors.length > 0 && (
          <Collapse in={response.vendors.length > 0}>
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>References</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.vendors.map((vendor, index) => (
                      <TableRow key={index}>
                        <TableCell>{vendor.name}</TableCell>
                        <TableCell>{vendor.description}</TableCell>
                        <TableCell>{vendor.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2} textAlign="right">
                <CSVLink data={response.vendors} headers={headers} filename={"vendors.csv"}>
                  <Button variant="outlined" color="secondary">Download CSV</Button>
                </CSVLink>
              </Box>
            </Box>
          </Collapse>
        )}
      </Box>
    </Container>
  );
};

export default GenerateVendors;
