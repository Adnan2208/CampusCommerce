import Order from '../models/Order.js';
import User from '../models/User.js';

// Initiate payment - Generate UPI payment details
export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify buyer is making the payment
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can initiate payment'
      });
    }

    // Check if order is completed (goods delivered)
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be made after goods are delivered'
      });
    }

    // Check if already paid
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Get seller's UPI ID
    const seller = await User.findById(order.sellerId);
    if (!seller || !seller.upiId) {
      return res.status(400).json({
        success: false,
        message: 'Seller UPI ID not configured. Please contact seller.'
      });
    }

    // Return payment details
    res.status(200).json({
      success: true,
      message: 'Payment details retrieved',
      data: {
        orderId: order._id,
        amount: order.productPrice,
        sellerUpiId: seller.upiId,
        sellerName: seller.name,
        productTitle: order.productTitle,
        transactionNote: `Payment for ${order.productTitle}`
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

// Mark payment as completed
export const completePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Check if screenshot was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify buyer is completing the payment
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can complete payment'
      });
    }

    // Check if already paid
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Update payment status to pending approval
    order.payment.status = 'pending_approval';
    order.payment.paymentScreenshot = `/uploads/${req.file.filename}`;
    order.payment.paymentMethod = 'upi';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment screenshot uploaded. Waiting for seller approval.',
      data: order
    });

  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete payment',
      error: error.message
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user is buyer or seller
    if (order.buyerId.toString() !== userId && order.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        paymentStatus: order.payment.status,
        amount: order.payment.amount,
        transactionId: order.payment.transactionId,
        paidAt: order.payment.paidAt,
        paymentMethod: order.payment.paymentMethod
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// Mark payment as cash (alternative to UPI)
export const markCashPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify buyer is marking cash payment
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can mark cash payment'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be made after goods are delivered'
      });
    }

    // Check if already paid
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Update payment status
    order.payment.status = 'completed';
    order.payment.paymentMethod = 'cash';
    order.payment.paidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment recorded successfully',
      data: order
    });

  } catch (error) {
    console.error('Mark cash payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record cash payment',
      error: error.message
    });
  }
};

// Seller approves or rejects payment
export const approvePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved } = req.body; // true to approve, false to reject
    const userId = req.user.userId;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify seller is approving the payment
    if (order.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can approve payment'
      });
    }

    // Check if payment is pending approval
    if (order.payment.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending approval'
      });
    }

    // Update payment status based on approval
    if (approved) {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    } else {
      order.payment.status = 'failed';
      order.payment.paymentScreenshot = null; // Clear screenshot if rejected
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: approved ? 'Payment approved successfully' : 'Payment rejected',
      data: order
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment approval',
      error: error.message
    });
  }
};
