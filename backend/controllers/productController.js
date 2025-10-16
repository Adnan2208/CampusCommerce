import Product from '../models/Product.js';

// Get all products with filtering
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, condition, minPrice, maxPrice } = req.query;
    let query = { isSold: false };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { title, category, price, originalPrice, condition, description, location, image } = req.body;

    // Validate required fields
    if (!title || !category || !price || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: title, category, price, and location' 
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a product'
      });
    }

    // Get user details to get the actual name
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const productData = {
      title,
      category,
      price,
      originalPrice: originalPrice || price * 1.5,
      condition: condition || 'Good',
      description,
      location,
      image: image || '📦',
      seller: user.name, // Use actual user name from database
      userId: req.user.userId,
      sellerEmail: req.user.email,
      rating: 0
    };

    // Add coordinates if provided
    if (req.body.coordinates) {
      productData.coordinates = req.body.coordinates;
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to update a product'
      });
    }

    // Find the product first to check ownership
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if the user owns this product
    if (product.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own products' 
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to delete a product'
      });
    }

    // Find the product first to check ownership
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if the user owns this product
    if (product.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own products' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark product as sold
export const markAsSold = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isSold: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
