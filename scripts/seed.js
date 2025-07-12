const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const Game = require('../models/Game');
const Pack = require('../models/Pack');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-topup', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample games data
const gamesData = [
  {
    name: "Mobile Legends: Bang Bang",
    shortName: "MLBB",
    description: "5v5 MOBA game with epic battles and strategic gameplay",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "MOBA",
    isActive: true,
    isPopular: true,
    minTopUp: 1,
    maxTopUp: 10000,
    fields: [
      {
        name: "Game ID",
        type: "number",
        required: true,
        placeholder: "Enter your Game ID (e.g., 123456789)"
      },
      {
        name: "Zone ID",
        type: "number", 
        required: true,
        placeholder: "Enter your Zone ID (e.g., 2345)"
      }
    ],
    sortOrder: 1
  },
  {
    name: "Free Fire",
    shortName: "FF",
    description: "Ultimate Battle Royale game with intense survival gameplay",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Battle Royale",
    isActive: true,
    isPopular: true,
    minTopUp: 1,
    maxTopUp: 10000,
    fields: [
      {
        name: "Player ID",
        type: "number",
        required: true,
        placeholder: "Enter your Player ID (e.g., 123456789)"
      }
    ],
    sortOrder: 2
  },
  {
    name: "PUBG Mobile",
    shortName: "PUBGM",
    description: "Battle Royale game with realistic combat and intense gameplay",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Battle Royale",
    isActive: true,
    isPopular: false,
    minTopUp: 1,
    maxTopUp: 10000,
    fields: [
      {
        name: "Player ID",
        type: "number",
        required: true,
        placeholder: "Enter your Player ID (e.g., 123456789)"
      }
    ],
    sortOrder: 3
  }
];

// MLBB Packs data as provided
const mlbbPacksData = [
  { smilePackId: "22590", name: "mobilelegends BR 55 Diamond", price: 4.00 },
  { smilePackId: "22591", name: "mobilelegends BR 165 Diamond", price: 11.99 },
  { smilePackId: "22592", name: "mobilelegends BR 275 Diamond", price: 19.75 },
  { smilePackId: "22593", name: "mobilelegends BR 565 Diamond", price: 40.50 },
  { smilePackId: "13", name: "mobilelegends BR 78&8 Diamond", price: 6.25 },
  { smilePackId: "23", name: "mobilelegends BR 156&16 Diamond", price: 12.50 },
  { smilePackId: "25", name: "mobilelegends BR 234&23 Diamond", price: 18.67 },
  { smilePackId: "26", name: "mobilelegends BR 625&81 Diamond", price: 50.00 },
  { smilePackId: "27", name: "mobilelegends BR 1860&335 Diamond", price: 150.00 },
  { smilePackId: "28", name: "mobilelegends BR 3099&589 Diamond", price: 250.00 },
  { smilePackId: "29", name: "mobilelegends BR 4649&883 Diamond", price: 375.00 },
  { smilePackId: "30", name: "mobilelegends BR 7740&1548 Diamond", price: 625.00 },
  { smilePackId: "33", name: "mobilelegends BR Passagem...", price: 41.25 },
  { smilePackId: "16642", name: "Mobile Legends BR - Passe Semanal", price: 8.00 }
];

// Sample admin user
const adminUser = {
  username: 'admin',
  email: 'admin@gametopup.com',
  password: 'smileadmin@123',
  role: 'admin',
  isActive: true
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Game.deleteMany({}),
      Pack.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await User.create({
      ...adminUser,
      password: hashedPassword
    });

    // Create games
    console.log('🎮 Creating games...');
    const createdGames = await Game.insertMany(gamesData);
    
    // Find MLBB game
    const mlbbGame = createdGames.find(game => game.shortName === 'MLBB');
    
    if (!mlbbGame) {
      throw new Error('MLBB game not found');
    }

    // Create MLBB packs
    console.log('💎 Creating MLBB packs...');
    const mlbbPacks = mlbbPacksData.map((pack, index) => ({
      gameId: mlbbGame._id,
      smilePackId: pack.smilePackId,
      name: pack.name,
      description: `${pack.name} - Instant delivery after payment verification`,
      price: pack.price,
      originalPrice: pack.price,
      discount: 0,
      isActive: true,
      isPopular: index < 4, // First 4 packs are popular
      sortOrder: index + 1,
      image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      tags: ['diamonds', 'mobile-legends', 'instant']
    }));

    await Pack.insertMany(mlbbPacks);

    // Create some sample packs for other games
    console.log('🎯 Creating sample packs for other games...');
    const otherGames = createdGames.filter(game => game.shortName !== 'MLBB');
    
    for (const game of otherGames) {
      const samplePacks = [
        {
          gameId: game._id,
          smilePackId: `${game.shortName}_001`,
          name: `${game.shortName} Starter Pack`,
          description: `Basic starter pack for ${game.name}`,
          price: 5.00,
          originalPrice: 5.00,
          discount: 0,
          isActive: true,
          isPopular: true,
          sortOrder: 1,
          image: game.image,
          tags: ['starter', 'basic']
        },
        {
          gameId: game._id,
          smilePackId: `${game.shortName}_002`,
          name: `${game.shortName} Premium Pack`,
          description: `Premium pack for ${game.name}`,
          price: 15.00,
          originalPrice: 15.00,
          discount: 0,
          isActive: true,
          isPopular: false,
          sortOrder: 2,
          image: game.image,
          tags: ['premium', 'advanced']
        },
        {
          gameId: game._id,
          smilePackId: `${game.shortName}_003`,
          name: `${game.shortName} Ultimate Pack`,
          description: `Ultimate pack for ${game.name}`,
          price: 50.00,
          originalPrice: 50.00,
          discount: 0,
          isActive: true,
          isPopular: false,
          sortOrder: 3,
          image: game.image,
          tags: ['ultimate', 'pro']
        }
      ];

      await Pack.insertMany(samplePacks);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Games created: ${createdGames.length}`);
    console.log(`   - MLBB packs created: ${mlbbPacksData.length}`);
    console.log(`   - Sample packs created: ${otherGames.length * 3}`);
    console.log(`   - Admin user created: admin / smileadmin@123`);
    console.log('');
    console.log('🚀 You can now start the server with: npm start');
    console.log('🔐 Admin panel: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

// Run the seeding
seedDatabase();