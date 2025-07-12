const express = require('express');
const Game = require('../models/Game');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get all active games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game by short name
router.get('/short/:shortName', async (req, res) => {
  try {
    const game = await Game.findOne({ shortName: req.params.shortName, isActive: true });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Get game by short name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes (require authentication)
router.use(verifyToken);

// Check if user is admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all games (admin)
router.get('/admin/all', checkAdmin, async (req, res) => {
  try {
    const games = await Game.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(games);
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create game (admin)
router.post('/', checkAdmin, [
  body('name').trim().notEmpty().withMessage('Game name is required'),
  body('shortName').trim().notEmpty().withMessage('Short name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('image').trim().notEmpty().withMessage('Image URL is required'),
  body('category').isIn(['MOBA', 'Battle Royale', 'RPG', 'Strategy', 'Action', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    console.error('Create game error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Game short name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update game (admin)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Update game error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Game short name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete game (admin)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle game status (admin)
router.patch('/:id/toggle', checkAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.isActive = !game.isActive;
    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Toggle game status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;