const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Mock data
const mockGames = [
  {
    _id: '1',
    name: "Mobile Legends: Bang Bang",
    shortName: "MLBB",
    description: "5v5 MOBA game with epic battles and strategic gameplay",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "MOBA",
    isActive: true,
    isPopular: true
  },
  {
    _id: '2',
    name: "Free Fire",
    shortName: "FF",
    description: "Ultimate Battle Royale game with intense survival gameplay",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Battle Royale",
    isActive: true,
    isPopular: true
  },
  {
    _id: '3',
    name: "PUBG Mobile",
    shortName: "PUBGM",
    description: "Battle Royale game with realistic combat and intense gameplay",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Battle Royale",
    isActive: true,
    isPopular: false
  }
];

const mockPacks = [
  {
    _id: '1',
    gameId: '1',
    smilePackId: '22590',
    name: 'mobilelegends BR 55 Diamond',
    description: 'mobilelegends BR 55 Diamond - Instant delivery after payment verification',
    price: 4.00,
    originalPrice: 4.00,
    isActive: true,
    isPopular: true
  },
  {
    _id: '2',
    gameId: '1',
    smilePackId: '22591',
    name: 'mobilelegends BR 165 Diamond',
    description: 'mobilelegends BR 165 Diamond - Instant delivery after payment verification',
    price: 11.99,
    originalPrice: 11.99,
    isActive: true,
    isPopular: true
  },
  {
    _id: '3',
    gameId: '1',
    smilePackId: '22592',
    name: 'mobilelegends BR 275 Diamond',
    description: 'mobilelegends BR 275 Diamond - Instant delivery after payment verification',
    price: 19.75,
    originalPrice: 19.75,
    isActive: true,
    isPopular: true
  }
];

const mockOrders = [];

// Demo API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK - DEMO MODE',
    timestamp: new Date().toISOString(),
    mode: 'demo',
    message: 'This is a demo version. Data is not persisted.'
  });
});

app.get('/api/games', (req, res) => {
  res.json(mockGames);
});

app.get('/api/games/:id', (req, res) => {
  const game = mockGames.find(g => g._id === req.params.id);
  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ error: 'Game not found' });
  }
});

app.get('/api/packs/:gameId', (req, res) => {
  const packs = mockPacks.filter(p => p.gameId === req.params.gameId);
  res.json(packs);
});

app.post('/api/orders', (req, res) => {
  const order = {
    _id: Date.now().toString(),
    orderId: `ORDER-${Date.now()}-DEMO`,
    gameId: req.body.gameId,
    packId: req.body.packId,
    gameDetails: req.body.gameDetails,
    payment: req.body.payment,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockOrders.push(order);
  
  console.log('📦 New Demo Order Created:');
  console.log(`   Order ID: ${order.orderId}`);
  console.log(`   Game ID: ${order.gameDetails.gameId}`);
  console.log(`   Zone ID: ${order.gameDetails.zoneId}`);
  console.log(`   Transaction ID: ${order.payment.transactionId}`);
  console.log(`   Amount: ₹${order.payment.amount}`);
  console.log('');
  
  res.status(201).json(order);
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = mockOrders.find(o => o.orderId === req.params.orderId);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Mock admin login
app.post('/api/auth/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'smileadmin@123') {
    res.json({
      token: 'demo-token',
      user: {
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Mock admin routes
app.get('/api/admin/orders', (req, res) => {
  res.json(mockOrders);
});

app.put('/api/admin/orders/:id/approve', (req, res) => {
  const order = mockOrders.find(o => o._id === req.params.id);
  if (order) {
    order.status = 'completed';
    order.processedAt = new Date().toISOString();
    console.log(`✅ Order ${order.orderId} approved and processed`);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.put('/api/admin/orders/:id/reject', (req, res) => {
  const order = mockOrders.find(o => o._id === req.params.id);
  if (order) {
    order.status = 'failed';
    order.failureReason = req.body.reason || 'Rejected by admin';
    order.processedAt = new Date().toISOString();
    console.log(`❌ Order ${order.orderId} rejected: ${order.failureReason}`);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/game/:gameId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/game.html'));
});

app.get('/order/:orderId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/order.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 GameTopUp Demo Server Started!');
  console.log('');
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
  console.log('');
  console.log('👤 Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: smileadmin@123');
  console.log('');
  console.log('💳 UPI Payment ID: 7002610853@fam');
  console.log('');
  console.log('🎮 Demo Features:');
  console.log('   ✅ Browse games and packs');
  console.log('   ✅ Create demo orders');
  console.log('   ✅ Track orders by Order ID');
  console.log('   ✅ Admin panel with order management');
  console.log('   ✅ Responsive mobile design');
  console.log('');
  console.log('ℹ️  Note: This is a demo version. Data is not persisted.');
  console.log('   For full functionality, use the production version with MongoDB.');
});

module.exports = app;