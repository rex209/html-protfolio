const express = require('express');
const { verifyToken } = require('./auth');
const Game = require('../models/Game');
const Pack = require('../models/Pack');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

// Check if user is admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply middleware to all admin routes
router.use(verifyToken);
router.use(checkAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      totalGames,
      activeGames,
      totalPacks,
      activePacks,
      recentOrders,
      orderStats
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'failed' }),
      Game.countDocuments(),
      Game.countDocuments({ isActive: true }),
      Pack.countDocuments(),
      Pack.countDocuments({ isActive: true }),
      Order.find()
        .populate('gameId')
        .populate('packId')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$payment.amount' }
          }
        }
      ])
    ]);

    // Calculate revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.amount' }
        }
      }
    ]);

    res.json({
      stats: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          completed: completedOrders,
          failed: failedOrders
        },
        games: {
          total: totalGames,
          active: activeGames
        },
        packs: {
          total: totalPacks,
          active: activePacks
        },
        revenue: {
          today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        }
      },
      recentOrders,
      orderStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system info
router.get('/system-info', async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      arch: process.arch,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };

    res.json(systemInfo);
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const activities = await Order.find()
      .populate('gameId')
      .populate('packId')
      .populate('processedBy')
      .sort({ updatedAt: -1 })
      .limit(limit);

    res.json(activities);
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateRange;
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      ordersByDay,
      ordersByStatus,
      ordersByGame,
      revenueByDay,
      topPacks
    ] = await Promise.all([
      // Orders by day
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      
      // Orders by status
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Orders by game
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange }
          }
        },
        {
          $lookup: {
            from: 'games',
            localField: 'gameId',
            foreignField: '_id',
            as: 'game'
          }
        },
        {
          $unwind: '$game'
        },
        {
          $group: {
            _id: '$game.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
      
      // Revenue by day
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: dateRange }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            revenue: { $sum: '$payment.amount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      
      // Top packs
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange }
          }
        },
        {
          $lookup: {
            from: 'packs',
            localField: 'packId',
            foreignField: '_id',
            as: 'pack'
          }
        },
        {
          $unwind: '$pack'
        },
        {
          $group: {
            _id: '$pack.name',
            count: { $sum: 1 },
            revenue: { $sum: '$payment.amount' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ])
    ]);

    res.json({
      ordersByDay,
      ordersByStatus,
      ordersByGame,
      revenueByDay,
      topPacks,
      period
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear old data
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Order.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['failed', 'cancelled'] }
    });

    res.json({
      message: `Cleaned up ${result.deletedCount} old orders`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;