import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EggPage from './pages/EggPage';
import ChickenPage from './pages/ChickenPage';
import FarmPage from './pages/FarmPage';
import AuthorityPage from './pages/AuthorityPage';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eggs" element={<EggPage />} />
          <Route path="/chickens" element={<ChickenPage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/authority" element={<AuthorityPage />} />
        </Routes>
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        Blockchain Egg Tracking System &copy; {new Date().getFullYear()}
      </Box>
    </Box>
  );
};

export default App; 