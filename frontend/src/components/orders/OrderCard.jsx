import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PaymentModal from '../PaymentModal';

/**
 * OrderCard Component - Shows order details with payment integration
 * This component demonstrates how to integrate the payment feature
 */
const OrderCard = ({ order, onOrderUpdate, userRole = 'buyer' }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default OrderCard;
