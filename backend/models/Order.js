import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productTitle: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productImage: {
    type: String,
    default: '📦'
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  buyerPhone: {
    type: String,
    required: true
  },
  buyerLocation: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  pickupLocation: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ productId: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
