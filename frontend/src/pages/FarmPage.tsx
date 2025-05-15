import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

interface FarmInfo {
  name: string;
  location: string;
  ipfsHash: string;
  isAuthorized: boolean;
}

const FarmPage: React.FC = () => {
  const { farm, isConnected, isFarmOwner, isAuthority, connectWallet, loading: web3Loading } = useWeb3();
  
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit form
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editIpfsHash, setEditIpfsHash] = useState('');
  
  const fetchFarmInfo = async () => {
    if (!isConnected || !farm) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const name = await farm.name();
      const location = await farm.location();
      const ipfsHash = await farm.ipfsHash();
      const isAuthorized = await farm.isAuthorized();
      
      setFarmInfo({
        name,
        location,
        ipfsHash,
        isAuthorized
      });
      
      // Initialize edit form
      setEditName(name);
      setEditLocation(location);
      setEditIpfsHash(ipfsHash);
      
    } catch (err: any) {
      console.error('Failed to fetch farm information:', err);
      setError('Failed to fetch farm information: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isConnected) {
      fetchFarmInfo();
    }
  }, [isConnected, farm]);
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setSuccess(null);
  };
  
  const handleCancelEdit = () => {
    if (farmInfo) {
      setEditName(farmInfo.name);
      setEditLocation(farmInfo.location);
      setEditIpfsHash(farmInfo.ipfsHash);
    }
    setIsEditing(false);
    setError(null);
  };
  
  const handleUpdateFarm = async () => {
    if (!isConnected || !farm || !isFarmOwner) {
      setError('You do not have permission to update farm information');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const tx = await farm.updateInfo(
        editName,
        editLocation,
        editIpfsHash
      );
      
      await tx.wait();
      
      // Update successful
      setSuccess('Farm information updated successfully');
      setIsEditing(false);
      
      // Refresh information
      fetchFarmInfo();
      
    } catch (err: any) {
      console.error('Failed to update farm information:', err);
      setError('Update failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Farm Management
      </Typography>
      
      {!isConnected ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            Please connect your wallet to view and manage farm information
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
            disabled={web3Loading}
          >
            Connect Wallet
          </Button>
        </Paper>
      ) : (
        <>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {farmInfo && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Farm Information
                    </Typography>
                    {isFarmOwner && !isEditing && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleStartEdit}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {isEditing ? (
                    <Box component="form" noValidate>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Farm Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Location"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        margin="normal"
                        label="IPFS Hash (Optional)"
                        value={editIpfsHash}
                        onChange={(e) => setEditIpfsHash(e.target.value)}
                        placeholder="IPFS hash for more detailed information"
                      />
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleUpdateFarm}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Farm Name
                        </Typography>
                        <Typography variant="body1">
                          {farmInfo.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1">
                          {farmInfo.location}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Authorization Status
                        </Typography>
                        <Typography variant="body1" color={farmInfo.isAuthorized ? 'success.main' : 'error.main'}>
                          {farmInfo.isAuthorized ? 'Authorized' : 'Not Authorized'}
                        </Typography>
                      </Grid>
                      
                      {farmInfo.ipfsHash && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            IPFS Hash (Details)
                          </Typography>
                          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                            {farmInfo.ipfsHash}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Farm Functions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => window.location.href = '/chickens'}
                        fullWidth
                      >
                        Manage Chickens
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => window.location.href = '/eggs'}
                        fullWidth
                      >
                        Manage Eggs
                      </Button>
                    </Box>
                    
                    {!farmInfo?.isAuthorized && (
                      <Alert severity="warning" sx={{ mt: 3 }}>
                        Your farm is not authorized yet. Some features may not be available. Please contact system administrator for authorization.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {!farmInfo && !loading && (
            <Alert severity="info">
              No farm information found. If you are a farm owner, please contact the system administrator to register your farm.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default FarmPage; 