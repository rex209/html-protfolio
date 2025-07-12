const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['MOBA', 'Battle Royale', 'RPG', 'Strategy', 'Action', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  minTopUp: {
    type: Number,
    default: 1
  },
  maxTopUp: {
    type: Number,
    default: 10000
  },
  fields: [{
    name: String,
    type: String, // 'text', 'number', 'select'
    required: Boolean,
    placeholder: String,
    options: [String] // for select type
  }],
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);