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

const ChickenList = () => {
  const [chickens, setChickens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, we're using mock data
  // In a real app, you'd fetch this from the blockchain
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChickens([
        { id: 'CH001', breed: 'Leghorn', birthDate: '2023-01-15', isActive: true },
        { id: 'CH002', breed: 'Rhode Island Red', birthDate: '2023-02-20', isActive: true },
        { id: 'CH003', breed: 'Plymouth Rock', birthDate: '2023-03-10', isActive: false },
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
        <Typography variant="h4">Chickens</Typography>
        <Button
          variant="contained"
          component={Link}
          to="/chickens/add"
        >
          Register New Chicken
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
              <TableCell>Breed</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chickens.map((chicken) => (
              <TableRow key={chicken.id}>
                <TableCell>{chicken.id}</TableCell>
                <TableCell>{chicken.breed}</TableCell>
                <TableCell>{chicken.birthDate}</TableCell>
                <TableCell>{chicken.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/chickens/${chicken.id}`}
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

export default ChickenList; 