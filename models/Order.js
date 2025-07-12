const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  gameDetails: {
    gameId: {
      type: String,
      required: true
    },
    zoneId: {
      type: String,
      required: false
    },
    additionalFields: {
      type: Map,
      of: String
    }
  },
  customerInfo: {
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    }
  },
  payment: {
    method: {
      type: String,
      required: true,
      default: 'UPI'
    },
    transactionId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    upiId: {
      type: String,
      default: '7002610853@fam'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  smileOrderId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `ORDER-${timestamp}-${random}`;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'gameDetails.gameId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);