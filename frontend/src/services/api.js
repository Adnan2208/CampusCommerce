import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Product API calls
export const productAPI = {
  // Get all products with optional filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Mark product as sold
  markAsSold: async (id) => {
    try {
      const response = await api.patch(`/products/${id}/sold`);
      return response.data;
    } catch (error) {
      console.error('Error marking product as sold:', error);
      throw error;
    }
  },

  // Search products
  search: async (query) => {
    try {
      const response = await api.get('/products', { params: { search: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Filter by category
  filterByCategory: async (category) => {
    try {
      const response = await api.get('/products', { params: { category } });
      return response.data;
    } catch (error) {
      console.error('Error filtering products:', error);
      throw error;
    }
  },

  // Get user's own products (including delisted ones)
  getMyProducts: async () => {
    try {
      const response = await api.get('/products/my-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching user products:', error);
      throw error;
    }
  },

  // Upload image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};

// Order API calls
export const orderAPI = {
  // Place an order
  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get my orders (as buyer)
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },

  // Get received orders (as seller)
  getReceivedOrders: async () => {
    try {
      const response = await api.get('/orders/received-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching received orders:', error);
      throw error;
    }
  },

  // Update order status (seller)
  updateStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order (buyer)
  cancel: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};

// Payment API calls
export const paymentAPI = {
  // Initiate payment - Get payment details
  initiatePayment: async (orderId) => {
    try {
      const response = await api.get(`/payments/${orderId}/initiate`);
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  // Complete UPI payment with screenshot
  completePayment: async (orderId, screenshotFile) => {
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      
      const response = await api.post(`/payments/${orderId}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  },

  // Mark cash payment
  markCashPayment: async (orderId) => {
    try {
      const response = await api.post(`/payments/${orderId}/cash`);
      return response.data;
    } catch (error) {
      console.error('Error marking cash payment:', error);
      throw error;
    }
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/payments/${orderId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  },

  // Approve or reject payment (seller only)
  approvePayment: async (orderId, approved) => {
    try {
      const response = await api.post(`/payments/${orderId}/approve`, { approved });
      return response.data;
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  },
};

// User/Profile API calls
export const userAPI = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
};

export default api;
