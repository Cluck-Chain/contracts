import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Egg as EggIcon,
  Pets as ChickenIcon,
  Agriculture as FarmIcon,
  Security as AuthorityIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { connectWallet, disconnectWallet, isConnected, accounts, isAdmin, isAuthority, isFarmOwner, loading } = useWeb3();

  // Drawer navigation state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Account menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openAccountMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleCloseMenu();
  };

  // Navigation menu items
  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Egg Tracking', path: '/eggs', icon: <EggIcon /> },
    { text: 'Chicken Management', path: '/chickens', icon: <ChickenIcon /> },
    { text: 'Farm Management', path: '/farm', icon: <FarmIcon /> },
  ];

  // If admin or authority, add permission management page
  if (isAdmin || isAuthority) {
    navItems.push({ text: 'Permission Management', path: '/authority', icon: <AuthorityIcon /> });
  }

  // Generate drawer navigation content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Egg Tracking System
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              bgcolor: location.pathname === item.path ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(76, 175, 80, 0.05)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Blockchain Egg Tracking System
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', mx: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color="inherit"
                sx={{
                  mx: 1,
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {isConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAdmin && <Chip size="small" label="Admin" color="secondary" sx={{ mr: 1 }} />}
            {isAuthority && <Chip size="small" label="Authority" color="primary" sx={{ mr: 1 }} />}
            {isFarmOwner && <Chip size="small" label="Farm Owner" color="success" sx={{ mr: 1 }} />}
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleMenuClick}
              endIcon={<WalletIcon />}
              size="small"
            >
              {accounts[0]?.substring(0, 6)}...{accounts[0]?.substring(accounts[0].length - 4)}
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={openAccountMenu}
              onClose={handleCloseMenu}
            >
              <MenuItem disabled>
                {accounts[0]}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={connectWallet}
            disabled={loading}
            startIcon={<WalletIcon />}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {drawerContent}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 