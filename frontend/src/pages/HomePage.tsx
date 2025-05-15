import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Egg as EggIcon,
  Pets as ChickenIcon,
  Agriculture as FarmIcon,
  Security as AuthorityIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

const HomePage: React.FC = () => {
  const { isConnected, isAdmin, isAuthority, isFarmOwner, connectWallet } = useWeb3();
  
  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Blockchain Egg Tracking System
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, maxWidth: '70%' }}>
          This system uses blockchain technology to achieve transparent tracking throughout the egg lifecycle, ensuring traceable sources and destinations.
        </Typography>
        
        {!isConnected && (
          <Button
            variant="contained"
            color="secondary"
            onClick={connectWallet}
            sx={{ mt: 2 }}
          >
            Connect Wallet to Start
          </Button>
        )}
        
        <Box
          sx={{
            position: 'absolute',
            right: -50,
            bottom: -50,
            opacity: 0.2,
            fontSize: 220,
            transform: 'rotate(-15deg)',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <EggIcon fontSize="inherit" />
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" gutterBottom>
            System Features
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EggIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Egg Tracking
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Query egg information to learn about the egg's source, production date, and farm details.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/eggs"
                    startIcon={<SearchIcon />}
                  >
                    Query Eggs
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ChickenIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Chicken Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Query chicken information to learn about breeds, birth dates, and produced eggs.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/chickens"
                    startIcon={<SearchIcon />}
                  >
                    Query Chickens
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FarmIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      Farm Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View and manage farm information, including name, location, and authorization status.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/farm"
                    startIcon={<InfoIcon />}
                  >
                    Farm Information
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {(isAdmin || isAuthority) && (
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AuthorityIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h3">
                        Permission Management
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Manage authorities and farms, including adding new authorizations, registering farms, and revoking permissions.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to="/authority"
                      startIcon={<AddIcon />}
                    >
                      Manage Permissions
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              What Can I Do?
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!isConnected ? (
              <Box>
                <Typography variant="body2" paragraph>
                  Please connect your wallet first. You can access different features based on your permissions.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={connectWallet}
                >
                  Connect Wallet
                </Button>
              </Box>
            ) : (
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SearchIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Query egg and chicken information" />
                </ListItem>
                
                {isFarmOwner && (
                  <>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AddIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Register new chickens and eggs" />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Manage farm information" />
                    </ListItem>
                  </>
                )}
                
                {(isAdmin || isAuthority) && (
                  <>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AddIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Add new authority organizations" />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <FarmIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Manage farm authorizations" />
                    </ListItem>
                  </>
                )}
                
                {isAdmin && (
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AuthorityIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="System administration functions" />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 