import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const seedProducts = [
  {
    title: 'Engineering Mathematics Textbook',
    category: 'Books',
    price: 299,
    originalPrice: 599,
    condition: 'Like New',
    description: 'Complete textbook for Engineering Mathematics. All chapters covered with solved examples.',
    location: 'Campus Gate 2',
    image: '📘',
    seller: 'Rahul Kumar',
    rating: 4.5
  },
  {
    title: 'HP Laptop i5 8th Gen',
    category: 'Electronics',
    price: 25000,
    originalPrice: 45000,
    condition: 'Good',
    description: 'Excellent condition HP laptop with i5 8th generation processor. Perfect for students. 8GB RAM, 256GB SSD, 15.6" display. Battery backup 4-5 hours.',
    location: 'Boys Hostel',
    image: '💻',
    seller: 'Priya Sharma',
    rating: 4.8
  },
  {
    title: 'Study Table with Chair',
    category: 'Furniture',
    price: 1500,
    originalPrice: 3000,
    condition: 'Fair',
    description: 'Sturdy wooden study table with comfortable chair. Perfect for hostel rooms.',
    location: 'Girls Hostel',
    image: '🪑',
    seller: 'Amit Patel',
    rating: 4.3
  },
  {
    title: 'Scientific Calculator',
    category: 'Stationery',
    price: 450,
    originalPrice: 800,
    condition: 'Excellent',
    description: 'Casio scientific calculator in excellent condition. All functions working perfectly.',
    location: 'Library',
    image: '🔢',
    seller: 'Sneha Reddy',
    rating: 4.7
  },
  {
    title: 'Cricket Bat and Ball Set',
    category: 'Sports',
    price: 800,
    originalPrice: 1500,
    condition: 'Good',
    description: 'Kashmir willow cricket bat with 3 tennis balls. Great for practice sessions.',
    location: 'Sports Complex',
    image: '🏏',
    seller: 'Vikram Singh',
    rating: 4.4
  },
  {
    title: 'College Hoodie',
    category: 'Clothing',
    price: 350,
    originalPrice: 700,
    condition: 'Like New',
    description: 'Official college hoodie, size L. Worn only twice, excellent condition.',
    location: 'Main Building',
    image: '👕',
    seller: 'Ananya Verma',
    rating: 4.6
  }
];

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuscommerce';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert seed products
    const products = await Product.insertMany(seedProducts);
    console.log(`✅ Added ${products.length} seed products`);

    console.log('\n📦 Seed products:');
    products.forEach(product => {
      console.log(`   - ${product.title} (₹${product.price})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
