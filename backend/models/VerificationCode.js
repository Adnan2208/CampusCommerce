import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  userData: {
    name: { type: String, required: true },
    password: { type: String, required: true }, // This will be hashed
    phone: { type: String, required: true },
    location: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
  }
});

// Index for faster lookups
verificationCodeSchema.index({ email: 1, code: 1 });

export default mongoose.model('VerificationCode', verificationCodeSchema);
