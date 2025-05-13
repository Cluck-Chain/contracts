import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const Dashboard = () => {
  const { chickenEggTracker, connectWallet, account, loading, error } = useWeb3();
  const [stats, setStats] = useState({
    chickenCount: 0,
    eggCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  // For demo purposes, we're just simulating stats
  // In a real app, you'd fetch this from the blockchain
  useEffect(() => {
    setStats({
      chickenCount: 12,
      eggCount: 45
    });
  }, []);

  const handleConnectWallet = async () => {
    try {
      setConnectError('');
      const success = await connectWallet();
      if (!success) {
        setConnectError('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectError('Error connecting wallet');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Farm Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {connectError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {connectError}
        </Alert>
      )}

      {!account && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography paragraph>
            Connect your MetaMask wallet to interact with the blockchain.
          </Typography>
          <Button
            variant="contained"
            onClick={handleConnectWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </Paper>
      )}

      {account && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1">
            Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Chickens
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.chickenCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total registered chickens in the farm
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/chickens">
                View All Chickens
              </Button>
              <Button size="small" component={Link} to="/chickens/add">
                Register New Chicken
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Eggs
              </Typography>
              <Typography variant="h3" color="secondary">
                {stats.eggCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total eggs tracked in the farm
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/eggs">
                View All Eggs
              </Button>
              <Button size="small" component={Link} to="/eggs/add">
                Register New Egg
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 