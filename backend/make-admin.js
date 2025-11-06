import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuscommerce';

async function makeUserAdmin(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email });
    
    if (!user) {
      console.log(`📝 User with email "${email}" not found. Creating new admin user...`);
      
      // Create new admin user with default password "password"
      user = new User({
        name: 'Admin',
        email: email,
        password: 'password',
        phone: '0000000000',
        location: 'Admin Office',
        isAdmin: true
      });
      
      await user.save();
      console.log(`✅ Successfully created new admin user: ${user.name} (${email})`);
      console.log(`🔑 Default password: "password" - Please login and change it!`);
      process.exit(0);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ Successfully made ${user.name} (${email}) an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <user-email>');
  console.log('Example: node make-admin.js admin@example.com');
  process.exit(1);
}

makeUserAdmin(email);
