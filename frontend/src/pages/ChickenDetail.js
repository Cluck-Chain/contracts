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
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const ChickenDetail = () => {
  const { id } = useParams();
  const [chicken, setChicken] = useState(null);
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, we're using mock data
  // In a real app, you'd fetch this from the blockchain
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Find chicken by ID
      const chickenData = {
        id: 'CH001',
        breed: 'Leghorn',
        birthDate: '2023-01-15',
        isActive: true,
        registrationDate: '2023-01-20',
        ipfsHash: 'QmXyZ123456789'
      };

      // Eggs from this chicken
      const eggsData = [
        { id: 'EG001', productionDate: '2023-05-15', isActive: true },
        { id: 'EG002', productionDate: '2023-05-16', isActive: true }
      ];

      setChicken(chickenData);
      setEggs(eggsData);
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

  if (!chicken) {
    return (
      <Alert severity="error">
        Chicken with ID {id} not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Chicken: {chicken.id}</Typography>
        <Button
          variant="outlined"
          component={Link}
          to="/chickens"
        >
          Back to Chickens
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Chicken Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2">ID:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{chicken.id}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Breed:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{chicken.breed}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Birth Date:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{chicken.birthDate}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Status:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{chicken.isActive ? 'Active' : 'Inactive'}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2">Registration Date:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{chicken.registrationDate}</Typography>
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
                  {chicken.ipfsHash}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={() => alert('Not implemented in demo')}>
                Update Info
              </Button>
              <Button variant="outlined" color="error" onClick={() => alert('Not implemented in demo')}>
                {chicken.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Eggs Produced
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {eggs.length > 0 ? (
              <Grid container spacing={2}>
                {eggs.map((egg) => (
                  <Grid item xs={12} key={egg.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">
                          Egg ID: {egg.id}
                        </Typography>
                        <Typography>
                          Production Date: {egg.productionDate}
                        </Typography>
                        <Typography>
                          Status: {egg.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          component={Link}
                          to={`/eggs/${egg.id}`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No eggs recorded for this chicken yet.</Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                component={Link}
                to="/eggs/add"
                state={{ chickenId: chicken.id }}
              >
                Register New Egg for This Chicken
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChickenDetail; 