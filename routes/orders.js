const express = require('express');
const Order = require('../models/Order');
const Game = require('../models/Game');
const Pack = require('../models/Pack');
const { verifyToken } = require('./auth');
const { body, validationResult } = require('express-validator');
const { sendTelegramAlert } = require('../utils/telegram');
const { processSmileOrder } = require('../utils/smile-api');
const router = express.Router();

// Create new order
router.post('/', [
  body('gameId').notEmpty().withMessage('Game ID is required'),
  body('packId').notEmpty().withMessage('Pack ID is required'),
  body('gameDetails.gameId').trim().notEmpty().withMessage('Game user ID is required'),
  body('payment.transactionId').trim().notEmpty().withMessage('Transaction ID is required'),
  body('payment.amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify game and pack exist
    const game = await Game.findById(req.body.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const pack = await Pack.findById(req.body.packId);
    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    // Verify pack belongs to game
    if (pack.gameId.toString() !== req.body.gameId) {
      return res.status(400).json({ error: 'Pack does not belong to selected game' });
    }

    // Create order
    const order = new Order({
      gameId: req.body.gameId,
      packId: req.body.packId,
      gameDetails: req.body.gameDetails,
      customerInfo: req.body.customerInfo || {},
      payment: {
        ...req.body.payment,
        upiId: '7002610853@fam'
      },
      status: 'pending'
    });

    await order.save();

    // Send Telegram alert
    try {
      await sendTelegramAlert({
        orderId: order.orderId,
        game: game.name,
        gameId: order.gameDetails.gameId,
        zoneId: order.gameDetails.zoneId,
        pack: pack.name,
        amount: order.payment.amount,
        transactionId: order.payment.transactionId
      });
    } catch (telegramError) {
      console.error('Telegram alert error:', telegramError);
      // Don't fail the order creation if telegram fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order.orderId,
      order: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by order ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('gameId')
      .populate('packId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track order by game ID
router.get('/track/:gameId', async (req, res) => {
  try {
    const orders = await Order.find({ 'gameDetails.gameId': req.params.gameId })
      .populate('gameId')
      .populate('packId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Track orders error:', error);
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

// Get all orders (admin)
router.get('/admin/all', checkAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.game) {
      filter.gameId = req.query.game;
    }
    if (req.query.dateFrom) {
      filter.createdAt = { $gte: new Date(req.query.dateFrom) };
    }
    if (req.query.dateTo) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.dateTo) };
    }

    const orders = await Order.find(filter)
      .populate('gameId')
      .populate('packId')
      .populate('processedBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve order (admin)
router.patch('/:orderId/approve', checkAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('gameId')
      .populate('packId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    // Update order status
    order.status = 'processing';
    order.processedBy = req.user.userId;
    order.processedAt = new Date();
    order.adminNotes = req.body.adminNotes || '';

    await order.save();

    // Process with Smile API
    try {
      const smileResult = await processSmileOrder({
        orderId: order.orderId,
        gameId: order.gameDetails.gameId,
        zoneId: order.gameDetails.zoneId,
        packId: order.packId.smilePackId,
        amount: order.payment.amount
      });

      if (smileResult.success) {
        order.status = 'completed';
        order.smileOrderId = smileResult.orderId;
        order.completedAt = new Date();
      } else {
        order.status = 'failed';
        order.failureReason = smileResult.error || 'Smile API error';
      }

      await order.save();

      res.json({
        message: 'Order processed successfully',
        order: order,
        smileResult: smileResult
      });
    } catch (smileError) {
      console.error('Smile API error:', smileError);
      
      order.status = 'failed';
      order.failureReason = 'Smile API processing failed';
      await order.save();

      res.status(500).json({
        error: 'Failed to process with Smile API',
        order: order
      });
    }
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject order (admin)
router.patch('/:orderId/reject', checkAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    order.status = 'failed';
    order.processedBy = req.user.userId;
    order.processedAt = new Date();
    order.failureReason = req.body.reason || 'Rejected by admin';
    order.adminNotes = req.body.adminNotes || '';

    await order.save();

    res.json({
      message: 'Order rejected successfully',
      order: order
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order statistics (admin)
router.get('/admin/stats', checkAdmin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      stats,
      totalOrders,
      todayOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;