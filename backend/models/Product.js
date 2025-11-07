import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Books', 'Electronics', 'Furniture', 'Stationery', 'Sports', 'Clothing']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: function() {
      return this.price * 1.5;
    }
  },
  condition: {
    type: String,
    required: true,
    enum: ['Like New', 'Excellent', 'Good', 'Fair'],
    default: 'Good'
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    }
  },
  image: {
    type: String,
    default: '📦'
  },
  seller: {
    type: String,
    default: 'Anonymous'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sellerEmail: {
    type: String,
    required: [true, 'Seller email is required']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isSold: {
    type: Boolean,
    default: false
  },
  isDelisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for search functionality
productSchema.index({ title: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
