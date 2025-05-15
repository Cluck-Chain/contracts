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
      id={`egg-tabpanel-${index}`}
      aria-labelledby={`egg-tab-${index}`}
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

interface EggInfo {
  eggId: string;
  chickenId: string;
  productionDate: string;
  ipfsHash: string;
  isActive: boolean;
  registrationDate: number;
  farm: string;
}

const EggPage: React.FC = () => {
  const { chickenEggTracker, isConnected, isFarmOwner, connectWallet, loading: web3Loading } = useWeb3();
  const [searchId, setSearchId] = useState('');
  const [eggInfo, setEggInfo] = useState<EggInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  
  // New egg registration form state
  const [newEggId, setNewEggId] = useState('');
  const [newChickenId, setNewChickenId] = useState('');
  const [newProductionDate, setNewProductionDate] = useState('');
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
      setError('Please enter an egg ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setEggInfo(null);
      
      // Temporary solution: Due to ABI issues, we return mock data
      console.log('Attempting to query egg:', searchId);
      
      // If ABI is normal, can use the following code to call the contract
      // const info = await chickenEggTracker!.getEggInfo(searchId);
      // setEggInfo({
      //   eggId: info[0],
      //   chickenId: info[1],
      //   productionDate: info[2],
      //   ipfsHash: info[3],
      //   isActive: info[4],
      //   registrationDate: Number(info[5]),
      //   farm: info[6]
      // });
      
      // Generate some mock data
      setTimeout(() => {
        if (searchId === 'EGG001') {
          setEggInfo({
            eggId: 'EGG001',
            chickenId: 'CHICKEN001',
            productionDate: '2023-10-01',
            ipfsHash: 'ipfs://QmEgg001',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
            farm: '0x8464135c8F25Da09e49BC8782676a84730C318bC'
          });
        } else if (searchId === 'EGG002') {
          setEggInfo({
            eggId: 'EGG002',
            chickenId: 'CHICKEN002',
            productionDate: '2023-10-02',
            ipfsHash: 'ipfs://QmEgg002',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 29 * 24 * 60 * 60,
            farm: '0x8464135c8F25Da09e49BC8782676a84730C318bC'
          });
        } else if (searchId === 'EGG003') {
          setEggInfo({
            eggId: 'EGG003',
            chickenId: 'CHICKEN003',
            productionDate: '2023-10-03',
            ipfsHash: 'ipfs://QmEgg003',
            isActive: true,
            registrationDate: Math.floor(Date.now() / 1000) - 28 * 24 * 60 * 60,
            farm: '0x8464135c8F25Da09e49BC8782676a84730C318bC'
          });
        } else {
          setError('Egg information not found');
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
    // Reset form
    setNewEggId('');
    setNewChickenId('');
    setNewProductionDate('');
    setNewIpfsHash('');
  };
  
  const handleRegisterEgg = async () => {
    if (!isConnected || !isFarmOwner) {
      setError('You do not have permission to register eggs');
      return;
    }
    
    if (!newEggId || !newChickenId || !newProductionDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Temporary solution: Normally should call contract functions, but due to ABI issues,
      // we just simulate success, later retrieve data from blockchain or redeploy the contract
      console.log('Attempting to register egg:', {
        eggId: newEggId,
        chickenId: newChickenId,
        productionDate: newProductionDate,
        ipfsHash: newIpfsHash || ''
      });
      
      // If ABI is normal, can use the following code to call the contract
      // const tx = await chickenEggTracker!.registerEgg(
      //   newEggId,
      //   newChickenId,
      //   newProductionDate,
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
        setNewEggId('');
        setNewChickenId('');
        setNewProductionDate('');
        setNewIpfsHash('');
      }, 1500);
      
    } catch (err: any) {
      console.error('Egg registration error:', err);
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
        Egg Tracking System
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="egg tracking tabs"
        >
          <Tab label="Query Egg" id="egg-tab-0" aria-controls="egg-tabpanel-0" />
          {isFarmOwner && (
            <Tab label="Register Egg" id="egg-tab-1" aria-controls="egg-tabpanel-1" />
          )}
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Egg ID"
                  variant="outlined"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter egg ID to query"
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
            
            {eggInfo && (
              <Card sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Egg Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Egg ID
                      </Typography>
                      <Typography variant="body1">
                        {eggInfo.eggId}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Source Chicken ID
                      </Typography>
                      <Typography variant="body1">
                        {eggInfo.chickenId}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Production Date
                      </Typography>
                      <Typography variant="body1">
                        {eggInfo.productionDate}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Registration Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(eggInfo.registrationDate)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Farm Address
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {eggInfo.farm}
                      </Typography>
                    </Grid>
                    
                    {eggInfo.ipfsHash && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          IPFS Hash (Details)
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                          {eggInfo.ipfsHash}
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
              Register New Egg
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Record new egg information on the blockchain to ensure traceability
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenRegisterDialog}
              disabled={!isConnected || !isFarmOwner}
              sx={{ mb: 2 }}
            >
              Register Egg
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
                Connect Wallet to Register Egg
              </Button>
            )}
            
            {isConnected && !isFarmOwner && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Only farm owners can register new eggs
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Register egg dialog */}
      <Dialog open={registerDialogOpen} onClose={handleCloseRegisterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Egg</DialogTitle>
        <DialogContent>
          {registerSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Egg registered successfully!
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
                label="Egg ID *"
                fullWidth
                variant="outlined"
                value={newEggId}
                onChange={(e) => setNewEggId(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Chicken ID *"
                fullWidth
                variant="outlined"
                value={newChickenId}
                onChange={(e) => setNewChickenId(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Note: Chicken must already be registered in the system"
              />
              
              <TextField
                margin="dense"
                label="Production Date *"
                fullWidth
                variant="outlined"
                placeholder="YYYY-MM-DD"
                value={newProductionDate}
                onChange={(e) => setNewProductionDate(e.target.value)}
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
              onClick={handleRegisterEgg} 
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

export default EggPage; 