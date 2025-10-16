import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { generateVerificationCode, sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Step 1: Send verification code
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists!'
      });
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Delete any existing verification codes for this email
    await VerificationCode.deleteMany({ email });

    // Store verification code and user data temporarily (password will be hashed when user is created)
    await VerificationCode.create({
      email,
      code,
      userData: {
        name,
        password, // Store plain password temporarily - will be hashed on user creation
        phone,
        location
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, code);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email!',
      testMode: emailResult.testMode,
      ...(emailResult.testMode && { code }) // Include code in response if in test mode
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification code'
    });
  }
});

// Step 2: Verify code and create user
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find verification code
    const verification = await VerificationCode.findOne({ email, code });
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Create the user with stored data (password will be hashed by pre-save hook)
    const user = new User({
      name: verification.userData.name,
      email: email,
      password: verification.userData.password,
      phone: verification.userData.phone,
      location: verification.userData.location
    });

    await user.save();

    // Delete the verification code
    await VerificationCode.deleteOne({ email, code });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now login.'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify code'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        upiId: user.upiId,
        initials: user.initials
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Verify token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        upiId: user.upiId,
        initials: user.initials
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, upiId } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (upiId !== undefined) user.upiId = upiId;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        upiId: user.upiId,
        initials: user.initials
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

export default router;
