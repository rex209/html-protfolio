const express = require('express');
const Pack = require('../models/Pack');
const Game = require('../models/Game');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Get packs by game ID
router.get('/game/:gameId', async (req, res) => {
  try {
    const packs = await Pack.find({ 
      gameId: req.params.gameId, 
      isActive: true 
    }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(packs);
  } catch (error) {
    console.error('Get packs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pack by ID
router.get('/:id', async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id).populate('gameId');
    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }
    res.json(pack);
  } catch (error) {
    console.error('Get pack error:', error);
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

// Get all packs (admin)
router.get('/admin/all', checkAdmin, async (req, res) => {
  try {
    const packs = await Pack.find().populate('gameId').sort({ createdAt: -1 });
    res.json(packs);
  } catch (error) {
    console.error('Get all packs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create pack (admin)
router.post('/', checkAdmin, [
  body('gameId').notEmpty().withMessage('Game ID is required'),
  body('smilePackId').trim().notEmpty().withMessage('Smile Pack ID is required'),
  body('name').trim().notEmpty().withMessage('Pack name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if game exists
    const game = await Game.findById(req.body.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const pack = new Pack(req.body);
    await pack.save();
    res.status(201).json(pack);
  } catch (error) {
    console.error('Create pack error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Smile Pack ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pack (admin)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const pack = await Pack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }
    res.json(pack);
  } catch (error) {
    console.error('Update pack error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Smile Pack ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pack (admin)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const pack = await Pack.findByIdAndDelete(req.params.id);
    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }
    res.json({ message: 'Pack deleted successfully' });
  } catch (error) {
    console.error('Delete pack error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle pack status (admin)
router.patch('/:id/toggle', checkAdmin, async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }
    
    pack.isActive = !pack.isActive;
    await pack.save();
    res.json(pack);
  } catch (error) {
    console.error('Toggle pack status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk upload packs via CSV (admin)
router.post('/bulk-upload', checkAdmin, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const gameId = req.body.gameId;
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const packs = [];
    const errors = [];

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const pack = {
            gameId: gameId,
            smilePackId: row.smilePackId || row.ID,
            name: row.name || row.Name,
            description: row.description || row.Description || row.name || row.Name,
            price: parseFloat(row.price || row.Price),
            originalPrice: parseFloat(row.originalPrice || row.OriginalPrice || row.price || row.Price),
            discount: parseFloat(row.discount || row.Discount || 0),
            isActive: row.isActive !== 'false' && row.isActive !== '0',
            isPopular: row.isPopular === 'true' || row.isPopular === '1',
            sortOrder: parseInt(row.sortOrder || row.SortOrder || 0),
            image: row.image || row.Image || '',
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
          };

          if (pack.smilePackId && pack.name && pack.price) {
            packs.push(pack);
          } else {
            errors.push(`Invalid data in row: ${JSON.stringify(row)}`);
          }
        } catch (error) {
          errors.push(`Error processing row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          if (packs.length === 0) {
            return res.status(400).json({ error: 'No valid packs found in CSV', errors });
          }

          // Insert packs
          const insertedPacks = await Pack.insertMany(packs, { ordered: false });
          
          res.json({
            message: `Successfully uploaded ${insertedPacks.length} packs`,
            inserted: insertedPacks.length,
            errors: errors.length > 0 ? errors : null
          });
        } catch (error) {
          console.error('Bulk upload error:', error);
          res.status(500).json({ error: 'Error saving packs to database' });
        }
      });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;