import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const EggDetail = () => {
  const { id } = useParams();
  const [egg, setEgg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, we're using mock data
  // In a real app, you'd fetch this from the blockchain
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Find egg by ID
      const eggData = {
        id: 'EG001',
        chickenId: 'CH001',
        productionDate: '2023-05-15',
        isActive: true,
        registrationDate: '2023-05-15',
        ipfsHash: 'QmAbC123456789'
      };

      setEgg(eggData);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!egg) {
    return (
      <Alert severity="error">
        Egg with ID {id} not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Egg: {egg.id}</Typography>
        <Button
          variant="outlined"
          component={Link}
          to="/eggs"
        >
          Back to Eggs
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Egg Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2">ID:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{egg.id}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Chicken ID:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Button
                  variant="text"
                  component={Link}
                  to={`/chickens/${egg.chickenId}`}
                  sx={{ p: 0 }}
                >
                  {egg.chickenId}
                </Button>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Production Date:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{egg.productionDate}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Status:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{egg.isActive ? 'Active' : 'Inactive'}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Registration Date:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{egg.registrationDate}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">IPFS Hash:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  {egg.ipfsHash}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={() => alert('Not implemented in demo')}>
                Update Info
              </Button>
              <Button variant="outlined" color="error" onClick={() => alert('Not implemented in demo')}>
                {egg.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                Egg Tracking Information
              </Typography>
              <Typography paragraph align="center">
                This egg was produced by chicken {egg.chickenId} on {egg.productionDate}.
              </Typography>
              <Typography paragraph align="center">
                It is currently {egg.isActive ? 'active in the system' : 'marked as inactive'}.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to={`/chickens/${egg.chickenId}`}
              >
                View Producer Chicken
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EggDetail; 