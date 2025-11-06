import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const GrievanceModal = ({ isOpen, onClose, onGrievanceSubmitted }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical Issue',
    description: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Technical Issue',
    'Payment Problem',
    'User Behavior',
    'Product Issue',
    'Feature Request',
    'Other'
  ];

  const priorities = ['Low', 'Medium', 'High'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to submit a grievance' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/grievances/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Grievance submitted successfully! We will review it soon.' });
        setFormData({
          subject: '',
          category: 'Technical Issue',
          description: '',
          priority: 'Medium'
        });
        
        // Call the callback to refresh grievances list
        if (onGrievanceSubmitted) {
          onGrievanceSubmitted();
        }
        
        setTimeout(() => {
          onClose();
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit grievance' });
      }
    } catch (error) {
      console.error('Error submitting grievance:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              💬 Help & Support
            </h2>
            <p className="text-orange-100 text-sm mt-1">We're here to help you with any issues</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message Alert */}
          {message.text && (
            <div className={`flex items-start gap-3 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 border-2 border-green-200 text-green-700'
                : 'bg-red-50 border-2 border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of your issue"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-800"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-800 bg-white"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.priority === priority
                      ? priority === 'High' 
                        ? 'bg-red-600 text-white shadow-lg'
                        : priority === 'Medium'
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Please describe your issue in detail. Include any relevant information that might help us understand and resolve your problem."
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-800 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 The more details you provide, the better we can assist you
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                '📤 Submit Grievance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrievanceModal;
