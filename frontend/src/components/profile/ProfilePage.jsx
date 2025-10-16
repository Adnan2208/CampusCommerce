import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Store, Edit2, Check, X, User as UserIcon } from 'lucide-react';
import OrderCard from '../orders/OrderCard';
import { orderAPI } from '../../services/api';

const ProfilePage = ({ userProfile, onUpdateProfile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [orders, setOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userProfile.name || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
    upiId: userProfile.upiId || ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [myOrdersRes, receivedOrdersRes] = await Promise.all([
        orderAPI.getMyOrders(),
        orderAPI.getReceivedOrders()
      ]);

      if (myOrdersRes.success) {
        setOrders(myOrdersRes.data);
      }
      if (receivedOrdersRes.success) {
        setReceivedOrders(receivedOrdersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUpdateProfile(data.user);
        setIsEditingProfile(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
  };

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: Store },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'received', label: 'Received Orders', icon: Package }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-3xl p-8 border border-blue-500/30 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userProfile.initials || 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{userProfile.name}</h2>
              <p className="text-gray-300">{userProfile.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-white hover:bg-white/10 rounded-full p-3 transition-all"
          >
            {isEditingProfile ? <X size={24} /> : <Edit2 size={24} />}
          </button>
        </div>

        {/* Profile Details or Edit Form */}
        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileInputChange}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileInputChange}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Location</label>
              <input
                type="text"
                name="location"
                value={profileForm.location}
                onChange={handleProfileInputChange}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                UPI ID <span className="text-xs text-gray-400">(for receiving payments)</span>
              </label>
              <input
                type="text"
                name="upiId"
                value={profileForm.upiId}
                onChange={handleProfileInputChange}
                placeholder="e.g., 9876543210@paytm or username@ybl"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter your UPI ID to receive payments from buyers
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileForm({
                    name: userProfile.name || '',
                    phone: userProfile.phone || '',
                    location: userProfile.location || '',
                    upiId: userProfile.upiId || ''
                  });
                }}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Phone</p>
              <p className="text-white font-medium">{userProfile.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Location</p>
              <p className="text-white font-medium">{userProfile.location || 'Not set'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 mb-1">UPI ID</p>
              <p className="text-white font-medium">
                {userProfile.upiId || (
                  <span className="text-yellow-400">⚠️ Not configured - Add UPI ID to receive payments</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : (
        <>
          {/* My Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">My Product Listings</h3>
              <p className="text-gray-400">Coming soon - Your listed products will appear here</p>
            </div>
          )}

          {/* My Orders (as Buyer) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={28} />
                My Orders ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      userRole="buyer"
                      onOrderUpdate={handleOrderUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Received Orders (as Seller) */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package size={28} />
                Received Orders ({receivedOrders.length})
              </h3>
              {receivedOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <Package size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No received orders yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {receivedOrders.map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      userRole="seller"
                      onOrderUpdate={handleOrderUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
