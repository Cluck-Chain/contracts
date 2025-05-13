require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const chickenRoutes = require('./routes/chicken');
const eggRoutes = require('./routes/egg');
const { router: authRoutes } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to blockchain
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://hardhat:8545');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chickens', chickenRoutes);
app.use('/api/eggs', eggRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 