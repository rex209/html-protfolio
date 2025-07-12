const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Game = require('../models/Game');
const Pack = require('../models/Pack');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    console.log('🌱 Starting simple database seeding...');

    // Create MLBB game first
    console.log('🎮 Creating Mobile Legends game...');
    
    const mlbbGame = await Game.create({
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
    });

    console.log('✅ MLBB game created successfully!');

    // Create MLBB packs
    console.log('💎 Creating MLBB packs...');
    
    const mlbbPacks = [
      { smilePackId: "22590", name: "55 Diamonds", price: 4.00 },
      { smilePackId: "22591", name: "165 Diamonds", price: 11.99 },
      { smilePackId: "22592", name: "275 Diamonds", price: 19.75 },
      { smilePackId: "22593", name: "565 Diamonds", price: 40.50 },
      { smilePackId: "13", name: "78+8 Diamonds", price: 6.25 },
      { smilePackId: "23", name: "156+16 Diamonds", price: 12.50 },
      { smilePackId: "25", name: "234+23 Diamonds", price: 18.67 },
      { smilePackId: "26", name: "625+81 Diamonds", price: 50.00 },
      { smilePackId: "27", name: "1860+335 Diamonds", price: 150.00 },
      { smilePackId: "28", name: "3099+589 Diamonds", price: 250.00 },
      { smilePackId: "29", name: "4649+883 Diamonds", price: 375.00 },
      { smilePackId: "30", name: "7740+1548 Diamonds", price: 625.00 }
    ];

    for (let i = 0; i < mlbbPacks.length; i++) {
      const pack = mlbbPacks[i];
      await Pack.create({
        gameId: mlbbGame._id,
        smilePackId: pack.smilePackId,
        name: pack.name,
        description: `Mobile Legends ${pack.name} - Instant delivery`,
        price: pack.price,
        originalPrice: pack.price,
        discount: 0,
        isActive: true,
        isPopular: i < 4,
        sortOrder: i + 1,
        image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f",
        tags: ['diamonds', 'mobile-legends', 'instant']
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - MLBB game created`);
    console.log(`   - ${mlbbPacks.length} MLBB packs created`);
    console.log('🚀 Your website is ready!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();