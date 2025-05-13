const express = require('express');
const router = express.Router();
const contractService = require('../services/contracts');

// Get all eggs
router.get('/', async (req, res) => {
  try {
    // This would normally be a DB query
    // For simplicity, we're just returning a message
    res.json({ message: 'API to list all eggs (would query DB)' });
  } catch (error) {
    console.error('Error fetching eggs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific egg
router.get('/:id', async (req, res) => {
  try {
    const eggInfo = await contractService.getEggInfo(req.params.id);
    res.json({
      eggId: eggInfo[0],
      chickenId: eggInfo[1],
      productionDate: eggInfo[2],
      ipfsHash: eggInfo[3],
      isActive: eggInfo[4],
      registrationDate: eggInfo[5].toString()
    });
  } catch (error) {
    console.error(`Error fetching egg ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Register a new egg
router.post('/', async (req, res) => {
  try {
    const { eggId, chickenId, productionDate, ipfsHash } = req.body;

    if (!eggId || !chickenId || !productionDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await contractService.registerEgg(
      eggId,
      chickenId,
      productionDate,
      ipfsHash || ''
    );

    res.status(201).json({
      message: 'Egg registered successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error('Error registering egg:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update egg information
router.put('/:id', async (req, res) => {
  try {
    const { ipfsHash } = req.body;

    if (!ipfsHash) {
      return res.status(400).json({ error: 'Missing ipfsHash field' });
    }

    const result = await contractService.updateEggInfo(req.params.id, ipfsHash);

    res.json({
      message: 'Egg information updated successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error(`Error updating egg ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Remove an egg
router.delete('/:id', async (req, res) => {
  try {
    const result = await contractService.removeEgg(req.params.id);

    res.json({
      message: 'Egg removed successfully',
      transactionHash: result.hash
    });
  } catch (error) {
    console.error(`Error removing egg ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 