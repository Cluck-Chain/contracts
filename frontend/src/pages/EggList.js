import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const EggList = () => {
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, we're using mock data
  // In a real app, you'd fetch this from the blockchain
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEggs([
        { id: 'EG001', chickenId: 'CH001', productionDate: '2023-05-15', isActive: true },
        { id: 'EG002', chickenId: 'CH001', productionDate: '2023-05-16', isActive: true },
        { id: 'EG003', chickenId: 'CH002', productionDate: '2023-05-15', isActive: true },
        { id: 'EG004', chickenId: 'CH002', productionDate: '2023-05-17', isActive: false },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Eggs</Typography>
        <Button
          variant="contained"
          component={Link}
          to="/eggs/add"
        >
          Register New Egg
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Chicken ID</TableCell>
              <TableCell>Production Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eggs.map((egg) => (
              <TableRow key={egg.id}>
                <TableCell>{egg.id}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    component={Link}
                    to={`/chickens/${egg.chickenId}`}
                  >
                    {egg.chickenId}
                  </Button>
                </TableCell>
                <TableCell>{egg.productionDate}</TableCell>
                <TableCell>{egg.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/eggs/${egg.id}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EggList; 