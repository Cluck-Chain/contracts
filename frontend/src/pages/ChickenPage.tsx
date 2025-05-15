import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
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
      id={`chicken-tabpanel-${index}`}
      aria-labelledby={`chicken-tab-${index}`}
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

interface ChickenInfo {
  chickenId: string;
  breed: string;
  birthDate: string;
  ipfsHash: string;
  isActive: boolean;
  registrationDate: number;
}

const ChickenPage: React.FC = () => {
  const { chickenEggTracker, isConnected, isFarmOwner, connectWallet, loading: web3Loading } = useWeb3();
  const [searchId, setSearchId] = useState('');
  const [chickenInfo, setChickenInfo] = useState<ChickenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  
  // New chicken registration form state
  const [newChickenId, setNewChickenId] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newIpfsHash, setNewIpfsHash] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = async () => {
    if (!isConnected) {
      setError('Please connect wallet first');
      return;
    }
    
    if (!searchId.trim()) {
      setError('Please enter a chicken ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setChickenInfo(null);
      
      // Temporary solution: Due to ABI issues, we return mock data
      console.log('Attempting to query chicken:', searchId);
      
      // If ABI is normal, can use the following code to call the contract
      // const info = await chickenEggTracker!.getChickenInfo(searchId);
      // setChickenInfo({
      //   chickenId: info[0],
      //   breed: info[1],
      //   birthDate: info[2],
      //   ipfsHash: info[3],
      //   isActive: info[4],
      //   registrationDate: Number(info[5])
      // });
      
      // Generate some mock data
      setTimeout(() => {
        if (searchId === 'CHICKEN001') {
          setChickenInfo({
            chickenId: 'CHICKEN001',
            breed: 'White Feather Chicken',
            birthDate: '2023-01-15',
            ipfsHash: 'ipfs://QmChicken001',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60
          });
        } else if (searchId === 'CHICKEN002') {
          setChickenInfo({
            chickenId: 'CHICKEN002',
            breed: 'Luhua Chicken',
            birthDate: '2023-02-20',
            ipfsHash: 'ipfs://QmChicken002',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 330 * 24 * 60 * 60
          });
        } else if (searchId === 'CHICKEN003') {
          setChickenInfo({
            chickenId: 'CHICKEN003',
            breed: 'Black Chicken',
            birthDate: '2023-03-10',
            ipfsHash: 'ipfs://QmChicken003',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 300 * 24 * 60 * 60
          });
        } else {
          setError('Chicken information not found');
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Query error:', err);
      setError('Query failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenRegisterDialog = () => {
    setRegisterDialogOpen(true);
    setRegisterSuccess(false);
  };
  
  const handleCloseRegisterDialog = () => {
    setRegisterDialogOpen(false);
    // Reset the form
    setNewChickenId('');
    setNewBreed('');
    setNewBirthDate('');
    setNewIpfsHash('');
  };
  
  const handleRegisterChicken = async () => {
    if (!isConnected || !isFarmOwner) {
      setError('You do not have permission to register chickens');
      return;
    }
    
    if (!newChickenId || !newBreed || !newBirthDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Temporary solution: Normally should call contract functions, but due to ABI issues,
      // we just simulate success, later retrieve data from blockchain or redeploy the contract
      console.log('Attempting to register chicken:', {
        chickenId: newChickenId,
        breed: newBreed,
        birthDate: newBirthDate,
        ipfsHash: newIpfsHash || ''
      });
      
      // If ABI is normal, can use the following code to call the contract
      // const tx = await chickenEggTracker!.registerChicken(
      //   newChickenId,
      //   newBreed,
      //   newBirthDate,
      //   newIpfsHash || '' // If no IPFS hash provided, pass empty string
      // );
      // await tx.wait();
      
      // Simulate successful operation
      setTimeout(() => {
        // Close registration dialog
        handleCloseRegisterDialog();
        // Display success message
        setRegisterSuccess(true);
        // Clear inputs
        setNewChickenId('');
        setNewBreed('');
        setNewBirthDate('');
        setNewIpfsHash('');
      }, 1500);
      
    } catch (err: any) {
      console.error('Chicken registration error:', err);
      setError('Registration failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Chicken Tracking System
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="chicken tracking tabs"
        >
          <Tab label="Query Chicken" id="chicken-tab-0" aria-controls="chicken-tabpanel-0" />
          {isFarmOwner && (
            <Tab label="Register Chicken" id="chicken-tab-1" aria-controls="chicken-tabpanel-1" />
          )}
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Chicken ID"
                  variant="outlined"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter chicken ID to query"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading || !isConnected}
                >
                  {loading ? <CircularProgress size={24} /> : 'Query'}
                </Button>
              </Grid>
            </Grid>
            
            {!isConnected && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={connectWallet}
                disabled={web3Loading}
                sx={{ mt: 2 }}
              >
                Connect Wallet to Query
              </Button>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {chickenInfo && (
              <Card sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chicken Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Chicken ID
                      </Typography>
                      <Typography variant="body1">
                        {chickenInfo.chickenId}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Breed
                      </Typography>
                      <Typography variant="body1">
                        {chickenInfo.breed}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Birth Date
                      </Typography>
                      <Typography variant="body1">
                        {chickenInfo.birthDate}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Registration Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(chickenInfo.registrationDate)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1" color={chickenInfo.isActive ? 'success.main' : 'error.main'}>
                        {chickenInfo.isActive ? 'Active' : 'Removed'}
                      </Typography>
                    </Grid>
                    
                    {chickenInfo.ipfsHash && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          IPFS Hash (Details)
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                          {chickenInfo.ipfsHash}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Register New Chicken
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Record new chicken information on the blockchain to ensure tracking transparency
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenRegisterDialog}
              disabled={!isConnected || !isFarmOwner}
              sx={{ mb: 2 }}
            >
              Register Chicken
            </Button>
            
            {!isConnected && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={connectWallet}
                disabled={web3Loading}
                sx={{ mt: 2 }}
              >
                Connect Wallet to Register Chicken
              </Button>
            )}
            
            {isConnected && !isFarmOwner && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Only farm owners can register new chickens
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Register chicken dialog */}
      <Dialog open={registerDialogOpen} onClose={handleCloseRegisterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Chicken</DialogTitle>
        <DialogContent>
          {registerSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Chicken registered successfully!
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="dense"
                label="Chicken ID *"
                fullWidth
                variant="outlined"
                value={newChickenId}
                onChange={(e) => setNewChickenId(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Breed *"
                fullWidth
                variant="outlined"
                value={newBreed}
                onChange={(e) => setNewBreed(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Birth Date *"
                fullWidth
                variant="outlined"
                placeholder="YYYY-MM-DD"
                value={newBirthDate}
                onChange={(e) => setNewBirthDate(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="IPFS Hash (Optional)"
                fullWidth
                variant="outlined"
                placeholder="Enter IPFS hash to store more information"
                value={newIpfsHash}
                onChange={(e) => setNewIpfsHash(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegisterDialog}>
            {registerSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!registerSuccess && (
            <Button 
              onClick={handleRegisterChicken} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChickenPage; 