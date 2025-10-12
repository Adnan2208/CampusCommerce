import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { productId, message } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to place an order'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is already sold
    if (product.isSold) {
      return res.status(400).json({
        success: false,
        message: 'This product is already sold'
      });
    }

    // Prevent user from ordering their own product
    if (product.userId.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot order your own product'
      });
    }

    // Get buyer details
    const buyer = await User.findById(req.user.userId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Get seller details
    const seller = await User.findById(product.userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Create order
    const order = await Order.create({
      productId: product._id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.image,
      buyerId: buyer._id,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      buyerLocation: buyer.location,
      sellerId: seller._id,
      sellerName: seller.name,
      sellerEmail: seller.email,
      message: message || '',
      pickupLocation: product.location,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order'
    });
  }
};

// Get all orders for current user (as buyer)
export const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const orders = await Order.find({ buyerId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'title image');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get all orders received (as seller)
export const getReceivedOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const orders = await Order.find({ sellerId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'title image');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get received orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only seller can update order status
    if (order.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can update order status'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    order.status = status;
    await order.save();

    // If order is completed, mark product as sold
    if (status === 'completed') {
      await Product.findByIdAndUpdate(order.productId, { isSold: true });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Cancel order (by buyer)
export const cancelOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only buyer can cancel their own order
    if (order.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders'
      });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};
