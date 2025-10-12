import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscommerce';

async function migrateSellers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products that have seller as "You" or need updating
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to check`);

    let updated = 0;
    let failed = 0;

    for (const product of products) {
      try {
        // Find the user who owns this product
        const user = await User.findById(product.userId);
        
        if (user) {
          // Update the product with the actual user's name
          product.seller = user.name;
          await product.save();
          updated++;
          console.log(`✅ Updated product "${product.title}" - seller: ${user.name}`);
        } else {
          console.log(`⚠️  No user found for product "${product.title}" (userId: ${product.userId})`);
          failed++;
        }
      } catch (err) {
        console.error(`❌ Error updating product "${product.title}":`, err.message);
        failed++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total products: ${products.length}`);
    console.log(`   Successfully updated: ${updated}`);
    console.log(`   Failed: ${failed}`);

    await mongoose.disconnect();
    console.log('\n✅ Migration completed and disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSellers();
