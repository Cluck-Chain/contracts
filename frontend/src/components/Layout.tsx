import React, { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Container, 
  Divider, 
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon, 
  AdminPanelSettings as AdminIcon, 
  Agriculture as FarmIcon, 
  Egg as EggIcon,
  Pets as ChickenIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected, accounts, isAuthority, isFarmOwner, connectWallet, loading } = useWeb3();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          Egg Tracking System
        </Typography>
        {isConnected ? (
          <Chip 
            label={`${accounts[0]?.substring(0, 6)}...${accounts[0]?.substring(accounts[0].length - 4)}`} 
            color="success" 
            variant="outlined" 
            size="small"
          />
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={connectWallet}
            disabled={loading}
          >
            Connect Wallet
          </Button>
        )}
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation('/')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        {isAuthority && (
          <ListItem button onClick={() => handleNavigation('/authority')}>
            <ListItemIcon>
              <AdminIcon />
            </ListItemIcon>
            <ListItemText primary="Permission Management" />
          </ListItem>
        )}
        
        {(isAuthority || isFarmOwner) && (
          <ListItem button onClick={() => handleNavigation('/farm')}>
            <ListItemIcon>
              <FarmIcon />
            </ListItemIcon>
            <ListItemText primary="Farm Management" />
          </ListItem>
        )}
        
        <ListItem button onClick={() => handleNavigation('/chickens')}>
          <ListItemIcon>
            <ChickenIcon />
          </ListItemIcon>
          <ListItemText primary="Chicken Tracking" />
        </ListItem>
        
        <ListItem button onClick={() => handleNavigation('/eggs')}>
          <ListItemIcon>
            <EggIcon />
          </ListItemIcon>
          <ListItemText primary="Egg Tracking" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Egg Tracking System
          </Typography>
          {!isConnected ? (
            <Button 
              color="inherit" 
              onClick={connectWallet}
              disabled={loading}
            >
              Connect Wallet
            </Button>
          ) : (
            <Chip 
              label={`${accounts[0]?.substring(0, 6)}...${accounts[0]?.substring(accounts[0].length - 4)}`} 
              color="secondary" 
              sx={{ color: 'white' }}
            />
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Blockchain Egg Tracking System © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 