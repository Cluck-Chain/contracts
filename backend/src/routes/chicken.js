const express = require('express');
const router = express.Router();
const contractService = require('../services/contracts');

// Get all chickens
router.get('/', async (req, res) => {
  try {
    // This would normally be a DB query
    // For simplicity, we're just returning a message
    res.json({ message: 'API to list all chickens (would query DB)' });
  } catch (error) {
    console.error('Error fetching chickens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific chicken
router.get('/:id', async (req, res) => {
  try {
    const chickenInfo = await contractService.getChickenInfo(req.params.id);
    res.json({
      chickenId: chickenInfo[0],
      breed: chickenInfo[1],
      birthDate: chickenInfo[2],
      ipfsHash: chickenInfo[3],
      isActive: chickenInfo[4],
      registrationDate: chickenInfo[5].toString()
    });
  } catch (error) {
    console.error(`Error fetching chicken ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Register a new chicken
router.post('/', async (req, res) => {
  try {
    const { chickenId, breed, birthDate, ipfsHash } = req.body;

    if (!chickenId || !breed || !birthDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await contractService.registerChicken(
      chickenId,
      breed,
      birthDate,
      ipfsHash || ''
    );

    res.status(201).json({
      message: 'Chicken registered successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error('Error registering chicken:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update chicken information
router.put('/:id', async (req, res) => {
  try {
    const { ipfsHash } = req.body;

    if (!ipfsHash) {
      return res.status(400).json({ error: 'Missing ipfsHash field' });
    }

    const result = await contractService.updateChickenInfo(req.params.id, ipfsHash);

    res.json({
      message: 'Chicken information updated successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error(`Error updating chicken ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Remove a chicken
router.delete('/:id', async (req, res) => {
  try {
    const result = await contractService.removeChicken(req.params.id);

    res.json({
      message: 'Chicken removed successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error(`Error removing chicken ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 