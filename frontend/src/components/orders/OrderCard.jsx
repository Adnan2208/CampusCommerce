import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import PaymentModal from '../PaymentModal';
import { paymentAPI } from '../../services/api';

/**
 * OrderCard Component - Shows order details with payment integration
 * This component demonstrates how to integrate the payment feature
 */
const OrderCard = ({ order, onOrderUpdate, userRole = 'buyer' }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine if payment button should be shown
  const showPaymentButton = () => {
    // Only buyers can make payments
    if (userRole !== 'buyer') return false;
    
    // Order must be completed (goods delivered)
    if (order.status !== 'completed') return false;
    
    // Payment must be pending
    if (order.payment?.status !== 'pending') return false;
    
    return true;
  };

  // Get payment status badge
  const getPaymentBadge = () => {
    if (!order.payment) return null;

    const status = order.payment.status;
    const method = order.payment.paymentMethod;

    if (status === 'completed') {
      return (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 text-green-300 px-3 py-2 rounded-lg text-sm">
          <CheckCircle size={16} />
          <span>Paid via {method === 'cash' ? 'Cash' : 'UPI'}</span>
          {order.payment.transactionId && (
            <span className="text-xs text-green-400">
              (ID: {order.payment.transactionId})
            </span>
          )}
        </div>
      );
    }

    if (status === 'pending_approval') {
      return (
        <div className="flex items-center gap-2 bg-orange-900/30 border border-orange-600 text-orange-300 px-3 py-2 rounded-lg text-sm">
          <Clock size={16} />
          <span>Payment Pending Approval</span>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-600 text-red-300 px-3 py-2 rounded-lg text-sm">
          <AlertCircle size={16} />
          <span>Payment Rejected</span>
        </div>
      );
    }

    if (status === 'pending' && order.status === 'completed') {
      return (
        <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-600 text-yellow-300 px-3 py-2 rounded-lg text-sm">
          <AlertCircle size={16} />
          <span>Payment Pending</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 bg-gray-700/30 border border-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm">
        <Clock size={16} />
        <span>Awaiting Delivery</span>
      </div>
    );
  };

  // Get order status badge
  const getOrderStatusBadge = () => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock, text: 'Pending' },
      accepted: { color: 'blue', icon: CheckCircle, text: 'Accepted' },
      completed: { color: 'green', icon: CheckCircle, text: 'Completed' },
      rejected: { color: 'red', icon: AlertCircle, text: 'Rejected' },
      cancelled: { color: 'gray', icon: AlertCircle, text: 'Cancelled' }
    };

    const config = statusConfig[order.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 bg-${config.color}-900/30 border border-${config.color}-600 text-${config.color}-300 px-3 py-2 rounded-lg text-sm`}>
        <Icon size={16} />
        <span>{config.text}</span>
      </div>
    );
  };

  const handlePaymentComplete = (updatedOrder) => {
    console.log('Payment completed:', updatedOrder);
    // Refresh orders list
    if (onOrderUpdate) {
      onOrderUpdate(updatedOrder);
    }
  };

  const handleApprovePayment = async (approved) => {
    try {
      setApproveLoading(true);
      setError(null);
      
      const data = await paymentAPI.approvePayment(order._id, approved);
      
      if (data.success) {
        if (onOrderUpdate) {
          onOrderUpdate(data.data);
        }
        setShowScreenshotModal(false);
      } else {
        setError(data.message || 'Failed to process payment approval');
      }
    } catch (err) {
      console.error('Approve payment error:', err);
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setApproveLoading(false);
    }
  };

  // Show approve payment buttons for seller
  const showApprovalButtons = () => {
    return userRole === 'seller' && order.payment?.status === 'pending_approval';
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl p-6 border border-blue-500/30 shadow-xl">
        {/* Product Info */}
        <div className="flex gap-4 mb-4">
          <div className="text-6xl">{order.productImage || '📦'}</div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">{order.productTitle}</h3>
            <p className="text-cyan-400 font-bold text-xl">₹{order.productPrice}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">
              {userRole === 'buyer' ? 'Seller:' : 'Buyer:'}
            </span>
            <span className="text-white">
              {userRole === 'buyer' ? order.sellerName : order.buyerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pickup Location:</span>
            <span className="text-white">{order.pickupLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Order Date:</span>
            <span className="text-white">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getOrderStatusBadge()}
          {getPaymentBadge()}
        </div>

        {/* Payment Button */}
        {showPaymentButton() && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Pay Now - ₹{order.productPrice}
          </button>
        )}

        {/* Show payment details if already paid */}
        {order.payment?.status === 'completed' && (
          <div className="mt-4 bg-slate-700/50 rounded-lg p-3 text-sm">
            <div className="text-gray-400 mb-1">Payment Details:</div>
            <div className="text-white space-y-1">
              <div>Method: <span className="text-cyan-400">{order.payment.paymentMethod === 'cash' ? 'Cash' : 'UPI'}</span></div>
              {order.payment.transactionId && (
                <div>Transaction ID: <span className="text-cyan-400">{order.payment.transactionId}</span></div>
              )}
              {order.payment.paidAt && (
                <div>Paid on: <span className="text-cyan-400">{new Date(order.payment.paidAt).toLocaleString()}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Seller Approval Section */}
        {showApprovalButtons() && (
          <div className="mt-4 space-y-3">
            <button
              onClick={() => setShowScreenshotModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ImageIcon size={20} />
              View Payment Screenshot
            </button>
            
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment pending approval notice for buyer */}
        {userRole === 'buyer' && order.payment?.status === 'pending_approval' && (
          <div className="mt-4 bg-orange-900/30 border border-orange-600 text-orange-200 px-4 py-3 rounded-lg text-sm">
            <p>Your payment screenshot has been submitted. Waiting for seller to verify and approve.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Screenshot Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-blue-500/30 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ImageIcon size={28} />
                Payment Screenshot
              </h2>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <h3 className="text-white font-semibold mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Product:</span>
                    <span className="text-white">{order.productTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-cyan-400 font-bold">₹{order.productPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buyer:</span>
                    <span className="text-white">{order.buyerName}</span>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              {order.payment?.paymentScreenshot && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <h3 className="text-white font-semibold mb-3">Payment Screenshot</h3>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.payment.paymentScreenshot}`}
                    alt="Payment screenshot"
                    className="w-full rounded-lg border border-slate-600"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Approval Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleApprovePayment(false)}
                  disabled={approveLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {approveLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <X size={20} />
                      Reject
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApprovePayment(true)}
                  disabled={approveLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {approveLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
