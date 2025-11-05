import { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, CheckCircle, AlertCircle, Copy, Upload, Image, QrCode } from 'lucide-react';
import { paymentAPI } from '../services/api';
import qrCodeImage from '../assets/AdnanQR.jpeg';

const PaymentModal = ({ order, onClose, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'cash'
  const [copied, setCopied] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

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

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setScreenshotFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleCompletePayment = async () => {
    if (paymentMethod === 'upi' && !screenshotFile) {
      setError('Please upload payment screenshot');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data;
      if (paymentMethod === 'upi') {
        data = await paymentAPI.completePayment(order._id, screenshotFile);
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
                  {/* QR Code Display */}
                  <div className="bg-white rounded-xl p-6 border border-slate-600 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode size={24} className="text-blue-600" />
                      <h3 className="text-slate-800 font-bold text-lg">Scan QR Code to Pay</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <img 
                        src={qrCodeImage} 
                        alt="UPI QR Code" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-slate-700 font-semibold text-sm">UPI ID: adnan.c2208@okaxis</p>
                      <p className="text-slate-600 text-sm mt-1">Adnan Chherawala</p>
                    </div>
                  </div>

                  {/* Payment Instructions Note */}
                  <div className="bg-blue-900/30 border border-blue-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-200">
                        <p className="font-semibold mb-1">Payment Instructions</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Scan the QR code above using any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                          <li>Complete the payment of ₹{paymentDetails?.amount}</li>
                          <li>Take a screenshot of the successful transaction</li>
                          <li>Upload the screenshot below to complete the order</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Upload Payment Screenshot:
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg border border-slate-600 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={20} />
                        {screenshotFile ? 'Change Screenshot' : 'Choose Screenshot'}
                      </label>
                      
                      {screenshotPreview && (
                        <div className="relative bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                          <div className="flex items-center gap-3">
                            <Image size={20} className="text-cyan-400" />
                            <span className="text-sm text-gray-300 flex-1">{screenshotFile?.name}</span>
                            <button
                              onClick={() => {
                                setScreenshotFile(null);
                                setScreenshotPreview(null);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <img
                            src={screenshotPreview}
                            alt="Payment screenshot preview"
                            className="mt-3 w-full rounded-lg max-h-48 object-contain bg-slate-800"
                          />
                        </div>
                      )}
                    </div>
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
                  Complete Your Payment
                </h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  {paymentMethod === 'upi' ? (
                    <>
                      <li>• Scan the QR code with your UPI app</li>
                      <li>• Complete the payment of ₹{paymentDetails?.amount}</li>
                      <li>• Take a screenshot of the successful transaction</li>
                      <li>• Upload the screenshot above and click "Submit Payment"</li>
                      <li>• Transaction will be completed after seller verification</li>
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
                disabled={loading || (paymentMethod === 'upi' && !screenshotFile)}
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
                    {paymentMethod === 'upi' ? 'Submit Payment' : 'Confirm Payment'}
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
