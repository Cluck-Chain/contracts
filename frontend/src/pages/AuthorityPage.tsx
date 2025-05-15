import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Check as CheckIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`authority-tabpanel-${index}`}
      aria-labelledby={`authority-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AuthorityPage: React.FC = () => {
  const { authorityCenter, isConnected, isAuthority, connectWallet, loading: web3Loading } = useWeb3();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Add authority dialog
  const [addAuthorityDialog, setAddAuthorityDialog] = useState(false);
  const [newAuthorityAddress, setNewAuthorityAddress] = useState('');
  
  // Register farm dialog
  const [registerFarmDialog, setRegisterFarmDialog] = useState(false);
  const [farmAddress, setFarmAddress] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmIpfsHash, setFarmIpfsHash] = useState('');
  
  // Revoke permission dialog
  const [revokeDialog, setRevokeDialog] = useState(false);
  const [revokeAddress, setRevokeAddress] = useState('');
  const [revokeType, setRevokeType] = useState<'authority' | 'farm'>('authority');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenAddAuthority = () => {
    setAddAuthorityDialog(true);
    setError(null);
    setSuccess(null);
  };
  
  const handleCloseAddAuthority = () => {
    setAddAuthorityDialog(false);
    setNewAuthorityAddress('');
  };
  
  const handleOpenRegisterFarm = () => {
    setRegisterFarmDialog(true);
    setError(null);
    setSuccess(null);
  };
  
  const handleCloseRegisterFarm = () => {
    setRegisterFarmDialog(false);
    setFarmAddress('');
    setFarmName('');
    setFarmLocation('');
    setFarmIpfsHash('');
  };
  
  const handleOpenRevoke = (address: string, type: 'authority' | 'farm') => {
    setRevokeDialog(true);
    setRevokeAddress(address);
    setRevokeType(type);
    setError(null);
  };
  
  const handleCloseRevoke = () => {
    setRevokeDialog(false);
    setRevokeAddress('');
  };
  
  const handleAddAuthority = async () => {
    if (!isConnected || !isAuthority) {
      setError('You do not have permission to add authorities');
      return;
    }
    
    if (!newAuthorityAddress || !ethers.isAddress(newAuthorityAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const tx = await authorityCenter!.addAuthority(newAuthorityAddress);
      await tx.wait();
      
      setSuccess('Authority added successfully');
      handleCloseAddAuthority();
      
    } catch (err: any) {
      console.error('Failed to add authority:', err);
      setError('Failed to add: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterFarm = async () => {
    if (!isConnected || !isAuthority) {
      setError('You do not have permission to register farms');
      return;
    }
    
    if (!farmAddress || !ethers.isAddress(farmAddress)) {
      setError('Please enter a valid farm Ethereum address');
      return;
    }
    
    if (!farmName || !farmLocation) {
      setError('Farm name and location are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const tx = await authorityCenter!.registerFarm(
        farmAddress,
        farmName,
        farmLocation,
        farmIpfsHash || '' // If IPFS hash is not provided, send empty string
      );
      
      await tx.wait();
      
      setSuccess('Farm registered successfully');
      handleCloseRegisterFarm();
      
    } catch (err: any) {
      console.error('Failed to register farm:', err);
      setError('Registration failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevoke = async () => {
    if (!isConnected || !isAuthority || !revokeAddress) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      let tx;
      if (revokeType === 'authority') {
        tx = await authorityCenter!.removeAuthority(revokeAddress);
      } else {
        tx = await authorityCenter!.removeFarm(revokeAddress);
      }
      
      await tx.wait();
      
      setSuccess(`Successfully revoked ${revokeType === 'authority' ? 'authority' : 'farm'} permission`);
      handleCloseRevoke();
      
    } catch (err: any) {
      console.error('Failed to revoke permission:', err);
      setError('Revocation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Sample authority and farm lists - in real application these should be fetched from the contract
  const authorityList = [
    '0x123456789abcdef123456789abcdef123456789a',
    '0x987654321fedcba987654321fedcba987654321'
  ];
  
  const farmList = [
    {
      address: '0xabcdef123456789abcdef123456789abcdef1234',
      name: 'Happy Farm',
      location: 'Hangzhou, Zhejiang'
    },
    {
      address: '0x123456789abcdef123456789abcdef12345678ab',
      name: 'Sunshine Ranch',
      location: 'Nanjing, Jiangsu'
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Authority Management Center
      </Typography>
      
      {!isConnected ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            Please connect your wallet to access authority management functions
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
      ) : !isAuthority ? (
        <Alert severity="warning">
          You do not have permission to access this page. Only authorized administrators can use authority management functions.
        </Alert>
      ) : (
        <>
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
          
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="authority management tabs"
            >
              <Tab label="Authority Management" id="authority-tab-0" aria-controls="authority-tabpanel-0" />
              <Tab label="Farm Management" id="authority-tab-1" aria-controls="authority-tabpanel-1" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddAuthority}
                >
                  Add Authority
                </Button>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Current Authority List
              </Typography>
              
              <List>
                {authorityList.map((address) => (
                  <React.Fragment key={address}>
                    <ListItem>
                      <ListItemText 
                        primary={address} 
                        secondary="Authorized Admin" 
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleOpenRevoke(address, 'authority')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                
                {authorityList.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No authorities found
                  </Typography>
                )}
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenRegisterFarm}
                >
                  Register New Farm
                </Button>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Registered Farm List
              </Typography>
              
              <Grid container spacing={2}>
                {farmList.map((farm) => (
                  <Grid item xs={12} key={farm.address}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" component="h3">
                            {farm.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {farm.location}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            Address: {farm.address}
                          </Typography>
                        </Box>
                        <IconButton 
                          color="error"
                          onClick={() => handleOpenRevoke(farm.address, 'farm')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
                
                {farmList.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No registered farms
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Paper>
          
          {/* Add authority dialog */}
          <Dialog open={addAuthorityDialog} onClose={handleCloseAddAuthority} maxWidth="sm" fullWidth>
            <DialogTitle>Add Authority</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Add a new authority that will gain permissions to manage farms and other authorities.
              </Typography>
              
              <TextField
                margin="dense"
                label="Ethereum Address *"
                fullWidth
                variant="outlined"
                value={newAuthorityAddress}
                onChange={(e) => setNewAuthorityAddress(e.target.value)}
                placeholder="0x..."
                error={!!newAuthorityAddress && !ethers.isAddress(newAuthorityAddress)}
                helperText={!!newAuthorityAddress && !ethers.isAddress(newAuthorityAddress) ? 'Please enter a valid Ethereum address' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddAuthority}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddAuthority} 
                variant="contained" 
                color="primary"
                disabled={loading || !newAuthorityAddress || !ethers.isAddress(newAuthorityAddress)}
              >
                {loading ? <CircularProgress size={24} /> : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Register farm dialog */}
          <Dialog open={registerFarmDialog} onClose={handleCloseRegisterFarm} maxWidth="sm" fullWidth>
            <DialogTitle>Register New Farm</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Register a new farm and authorize it to use the egg tracking system.
              </Typography>
              
              <TextField
                margin="dense"
                label="Farm Ethereum Address *"
                fullWidth
                variant="outlined"
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="0x..."
                error={!!farmAddress && !ethers.isAddress(farmAddress)}
                helperText={!!farmAddress && !ethers.isAddress(farmAddress) ? 'Please enter a valid Ethereum address' : ''}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Farm Name *"
                fullWidth
                variant="outlined"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Location *"
                fullWidth
                variant="outlined"
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="IPFS Hash (Optional)"
                fullWidth
                variant="outlined"
                value={farmIpfsHash}
                onChange={(e) => setFarmIpfsHash(e.target.value)}
                placeholder="Enter IPFS hash to store more information"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRegisterFarm}>
                Cancel
              </Button>
              <Button 
                onClick={handleRegisterFarm} 
                variant="contained" 
                color="primary"
                disabled={loading || !farmAddress || !farmName || !farmLocation || (!!farmAddress && !ethers.isAddress(farmAddress))}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Revoke permission dialog */}
          <Dialog open={revokeDialog} onClose={handleCloseRevoke} maxWidth="xs" fullWidth>
            <DialogTitle>Confirm Revocation</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to revoke permission for the following {revokeType === 'authority' ? 'authority' : 'farm'}?
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                {revokeAddress}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Note: This action cannot be undone!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseRevoke}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRevoke} 
                variant="contained" 
                color="error"
                startIcon={<CheckIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirm Revocation'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default AuthorityPage; 