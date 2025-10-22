import { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PaymentModal = ({ order, onClose, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'cash'
  const [upiLink, setUpiLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await paymentAPI.initiatePayment(order._id);

      if (data.success) {
        setPaymentDetails(data.data);
        generateUPILink(data.data);
      } else {
        setError(data.message || 'Failed to fetch payment details');
      }
    } catch (err) {
      console.error('Fetch payment error:', err);
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateUPILink = (details) => {
    try {
      // Generate redirect URL that will create UPI deep link
      const params = new URLSearchParams({
        pa: details.sellerUpiId,           // Payee Address (UPI ID)
        pn: details.sellerName,            // Payee Name
        am: details.amount.toString(),     // Amount
        tn: details.transactionNote || `Payment for ${details.productTitle}` // Transaction Note
      });

      // Use backend redirect endpoint
      const link = `http://localhost:5000/pay?${params.toString()}`;
      setUpiLink(link);
    } catch (err) {
      console.error('Generate UPI link error:', err);
      setError('Failed to generate UPI payment link');
    }
  };

  const handleUPIPayment = () => {
    if (upiLink) {
      // Redirect to backend endpoint which will redirect to UPI app
      window.location.href = upiLink;
    }
  };

  const handleCompletePayment = async () => {
    if (paymentMethod === 'upi' && !transactionId.trim()) {
      setError('Please enter transaction ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data;
      if (paymentMethod === 'upi') {
        data = await paymentAPI.completePayment(order._id, {
          transactionId,
          upiId: paymentDetails?.sellerUpiId
        });
      } else {
        data = await paymentAPI.markCashPayment(order._id);
      }

      if (data.success) {
        onPaymentComplete(data.data);
        onClose();
      } else {
        setError(data.message || 'Failed to complete payment');
      }
    } catch (err) {
      console.error('Complete payment error:', err);
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-3xl max-w-lg w-full shadow-2xl border border-blue-500/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet size={28} />
            Payment
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && !paymentDetails ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="text-gray-300 mt-4">Loading payment details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Order Details */}
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CreditCard size={20} />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Product:</span>
                    <span className="text-white font-medium">{paymentDetails?.productTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-cyan-400 font-bold text-lg">₹{paymentDetails?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seller:</span>
                    <span className="text-white">{paymentDetails?.sellerName}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="text-white font-semibold mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'upi'
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                  >
                    <Wallet size={24} className={`mx-auto mb-2 ${paymentMethod === 'upi' ? 'text-cyan-400' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${paymentMethod === 'upi' ? 'text-cyan-300' : 'text-gray-300'}`}>
                      UPI Payment
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                  >
                    <CreditCard size={24} className={`mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-green-400' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-green-300' : 'text-gray-300'}`}>
                      Cash Payment
                    </p>
                  </button>
                </div>
              </div>

              {/* UPI Payment Section */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  {/* UPI ID */}
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <label className="text-gray-400 text-sm mb-2 block">Pay to UPI ID:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={paymentDetails?.sellerUpiId || ''}
                        readOnly
                        className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600"
                      />
                      <button
                        onClick={() => copyToClipboard(paymentDetails?.sellerUpiId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Copy size={16} />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Pay with UPI App Button */}
                  <button
                    onClick={handleUPIPayment}
                    disabled={!upiLink}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink size={20} />
                    Pay with UPI App
                  </button>

                  {/* Transaction ID Input */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      After payment, enter Transaction ID:
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter UPI Transaction ID"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Cash Payment Section */}
              {paymentMethod === 'cash' && (
                <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <p className="font-semibold mb-1">Cash Payment Confirmation</p>
                      <p>By clicking "Confirm Payment", you confirm that you have paid ₹{paymentDetails?.amount} in cash to the seller.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-900/30 border border-blue-600/50 rounded-xl p-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Payment Instructions
                </h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  {paymentMethod === 'upi' ? (
                    <>
                      <li>• Click "Pay with UPI App" to open your UPI app</li>
                      <li>• Complete the payment in the UPI app</li>
                      <li>• Copy the transaction ID from your UPI app</li>
                      <li>• Paste it above and click "Confirm Payment"</li>
                    </>
                  ) : (
                    <>
                      <li>• Ensure you have paid the cash amount to seller</li>
                      <li>• Click "Confirm Payment" only after payment</li>
                      <li>• This action cannot be undone</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCompletePayment}
                disabled={loading || (paymentMethod === 'upi' && !transactionId.trim())}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm Payment
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
