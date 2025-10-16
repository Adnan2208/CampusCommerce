import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true,
    validate: {
      validator: function(phone) {
        // Basic phone validation (10 digits)
        return /^[0-9]{10}$/.test(phone);
      },
      message: 'Please provide a valid 10-digit phone number'
    }
  },
  location: {
    type: String,
    required: [true, 'Please provide your location'],
    trim: true
  },
  upiId: {
    type: String,
    default: null,
    trim: true,
    validate: {
      validator: function(upiId) {
        if (!upiId) return true; // Allow null/empty
        // UPI ID format: user@bank or phonenumber@bank
        return /^[\w.-]+@[\w.-]+$/.test(upiId);
      },
      message: 'Please provide a valid UPI ID (e.g., username@paytm or 9876543210@ybl)'
    }
  },
  initials: {
    type: String,
    default: function() {
      if (this.name) {
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      }
      return 'US';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Generate initials before saving
userSchema.pre('save', function(next) {
  if (this.name && !this.initials) {
    this.initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
