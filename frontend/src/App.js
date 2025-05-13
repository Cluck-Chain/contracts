import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ChickenList from './pages/ChickenList';
import ChickenDetail from './pages/ChickenDetail';
import EggList from './pages/EggList';
import EggDetail from './pages/EggDetail';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="chickens" element={<ChickenList />} />
          <Route path="chickens/:id" element={<ChickenDetail />} />
          <Route path="eggs" element={<EggList />} />
          <Route path="eggs/:id" element={<EggDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App; 