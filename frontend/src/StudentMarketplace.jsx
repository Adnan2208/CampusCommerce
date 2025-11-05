import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, User, Heart, Star, MapPin, MessageCircle, Plus, Home, Package, Edit2, Trash2, Store, X, ShoppingBag, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { productAPI, orderAPI } from './services/api';
import LocationTracker from './Components/LocationTracker';
import PaymentModal from './components/PaymentModal';

const StudentMarketplace = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [activePage, setActivePage] = useState('login');
  
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Product details state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Order state
  const [orders, setOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');
  
  // Location tracking state
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [productCoordinates, setProductCoordinates] = useState(null);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    upiId: '',
    initials: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: ''
  });

  // Email verification state
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Sell form state
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    price: '',
    originalPrice: '',
    condition: 'Like New',
    description: '',
    location: '',
    lat: '',
    lng: '',
    image: '📦'
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = [
    { id: 1, name: 'Books', icon: '📚', color: 'bg-blue-100' },
    { id: 2, name: 'Electronics', icon: '💻', color: 'bg-purple-100' },
    { id: 3, name: 'Furniture', icon: '🪑', color: 'bg-green-100' },
    { id: 4, name: 'Stationery', icon: '✏️', color: 'bg-yellow-100' },
    { id: 5, name: 'Sports', icon: '⚽', color: 'bg-red-100' },
    { id: 6, name: 'Clothing', icon: '👕', color: 'bg-pink-100' },
  ];

  const initialProducts = [
    {
      id: 1,
      title: 'Engineering Mathematics Textbook',
      price: 299,
      originalPrice: 599,
      image: '📘',
      seller: 'Rahul Kumar',
      rating: 4.5,
      location: 'Campus Gate 2',
      condition: 'Like New',
      category: 'Books',
    },
    {
      id: 2,
      title: 'HP Laptop i5 8th Gen',
      price: 25000,
      originalPrice: 45000,
      image: '💻',
      seller: 'Priya Sharma',
      rating: 4.8,
      location: 'Boys Hostel',
      condition: 'Good',
      category: 'Electronics',
    },
    {
      id: 3,
      title: 'Study Table with Chair',
      price: 1500,
      originalPrice: 3000,
      image: '🪑',
      seller: 'Amit Patel',
      rating: 4.3,
      location: 'Girls Hostel',
      condition: 'Fair',
      category: 'Furniture',
    },
    {
      id: 4,
      title: 'Scientific Calculator',
      price: 450,
      originalPrice: 800,
      image: '🔢',
      seller: 'Sneha Reddy',
      rating: 4.7,
      location: 'Library',
      condition: 'Excellent',
      category: 'Stationery',
    },
  ];

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userProfile');
    if (token && user) {
      setAuthToken(token);
      setUserProfile(JSON.parse(user));
      setIsAuthenticated(true);
      setActivePage('home');
    }
  }, []);

  // Fetch products and orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Auto-refresh orders when on profile page
  useEffect(() => {
    if (isAuthenticated && activePage === 'profile') {
      // Refresh orders immediately when navigating to profile
      fetchOrders();
      
      // Set up polling every 10 seconds
      const intervalId = setInterval(() => {
        fetchOrders();
      }, 10000); // 10 seconds

      // Cleanup interval on unmount or when leaving profile page
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, activePage]);

  // Auto-refresh products when on home page
  useEffect(() => {
    if (isAuthenticated && activePage === 'home') {
      // Refresh products immediately when navigating to home
      fetchProducts(true);
      
      // Set up polling every 15 seconds to check for new products (no loading spinner for background refresh)
      const intervalId = setInterval(() => {
        fetchProducts(false);
      }, 15000); // 15 seconds

      // Cleanup interval on unmount or when leaving home page
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, activePage]);

  const fetchProducts = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      setError(null);
      const response = await productAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (showLoadingSpinner) {
        setError('Failed to load products. Using sample data.');
        // Fallback to initial products if API fails
        setProducts(initialProducts);
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  const fetchOrders = async () => {
    try {
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
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setOrderMessage('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const response = await orderAPI.create({
        productId: selectedProduct._id,
        message: orderMessage
      });

      if (response.success) {
        alert('✅ Order placed successfully! The seller will contact you soon.');
        handleCloseModal();
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('❌ Failed to place order. ' + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderAPI.updateStatus(orderId, status);
      if (response.success) {
        // Enable live tracking when order is accepted
        if (status === 'accepted') {
          const order = receivedOrders.find(o => o._id === orderId);
          if (order && order.pickupCoordinates) {
            try {
              await fetch(`http://localhost:5000/api/orders/${orderId}/enable-tracking`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pickupCoordinates: order.pickupCoordinates })
              });
            } catch (trackError) {
              console.error('Failed to enable tracking:', trackError);
            }
          }
        }
        
        alert(`✅ Order ${status} successfully!`);
        fetchOrders(); // Refresh orders
        if (status === 'completed') {
          fetchProducts(); // Refresh products to update sold status
        }
      }
    } catch (error) {
      console.error('Update order status error:', error);
      alert('❌ Failed to update order status.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await orderAPI.cancel(orderId);
      if (response.success) {
        alert('✅ Order cancelled successfully!');
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('❌ Failed to cancel order.');
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Filter products based on search query and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.condition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle category click
  const handleCategoryClick = useCallback((categoryName) => {
    setSelectedCategory(prev => prev === categoryName ? null : categoryName);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  // Handle sell form input changes (optimized to prevent re-renders)
  const handleSellInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewProduct(prev => {
      // Only update if value actually changed
      if (prev[name] === value) {
        return prev;
      }
      return {
        ...prev,
        [name]: value
      };
    });
  }, []);
  
  // Handle profile input changes
  const handleProfileInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserProfile(prev => {
      // Only update if value actually changed
      if (prev[name] === value) {
        return prev;
      }
      return {
        ...prev,
        [name]: value
      };
    });
  }, []);

  // Helper function to render product image
  const renderProductImage = useCallback((imageUrl, size = 'large') => {
    // Check if it's a URL (uploaded image) - including data URLs from base64
    if (imageUrl && (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
      const fullUrl = imageUrl.startsWith('/uploads/') ? `http://localhost:5000${imageUrl}` : imageUrl;
      return (
        <img 
          src={fullUrl} 
          alt="Product" 
          className={`w-full h-full object-cover ${size === 'small' ? 'rounded-lg' : ''}`}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            parent.textContent = '📦';
            parent.className = parent.className.replace('overflow-hidden', 'flex items-center justify-center');
          }}
        />
      );
    }
    // Otherwise, render as emoji or text
    const fontSize = size === 'small' ? 'text-3xl' : 'text-7xl';
    return <span className={fontSize}>{imageUrl || '📦'}</span>;
  }, []);

  // Handle image upload - now uploads file to server instead of base64
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Please upload an image file');
        return;
      }

      try {
        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Show loading state
        setLoading(true);
        
        // Upload to server
        console.log('Uploading image to server...');
        const result = await productAPI.uploadImage(file);
        console.log('Image uploaded successfully:', result.imageUrl);
        
        // Store the server image URL (not the blob URL!)
        setNewProduct(prev => ({
          ...prev,
          image: result.imageUrl
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('❌ Failed to upload image. Please try again.');
        setImagePreview(null);
        setNewProduct(prev => ({
          ...prev,
          image: '📦'
        }));
        setLoading(false);
      }
    }
  }, []);

  // Handle form submission
  const handlePublishListing = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newProduct.title || !newProduct.category || !newProduct.price || !newProduct.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create product data for API
      const productData = {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        originalPrice: parseFloat(newProduct.originalPrice) || parseFloat(newProduct.price) * 1.5,
        image: newProduct.image, // Use the server URL, not the blob preview
        // seller name will be set by backend using authenticated user's name
        location: newProduct.location,
        condition: newProduct.condition,
        category: newProduct.category,
        description: newProduct.description
      };

      // Add coordinates if provided
      if (newProduct.lat && newProduct.lng) {
        productData.coordinates = {
          lat: parseFloat(newProduct.lat),
          lng: parseFloat(newProduct.lng)
        };
      }

      // Send to API
      console.log('Sending product data to API...', productData);
      const response = await productAPI.create(productData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        // Add to local state immediately for better UX
        setProducts(prev => [response.data, ...prev]);

        // Clean up blob URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }

        // Reset form
        setNewProduct({
          title: '',
          category: '',
          price: '',
          originalPrice: '',
          condition: 'Like New',
          description: '',
          location: '',
          lat: '',
          lng: '',
          image: '📦'
        });
        setImagePreview(null);

        // Show success message and navigate to home
        alert('✅ Product listed successfully!');
        setActivePage('home');
        
        // Refresh products from server
        await fetchProducts();
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to publish product. ';
      if (error.response) {
        errorMessage += error.response.data?.message || error.response.statusText;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = useCallback(async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await productAPI.delete(productId);
      
      // Remove from local state
      setProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
      
      alert('✅ Product deleted successfully!');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start editing product
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setNewProduct({
      title: product.title,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      condition: product.condition,
      description: product.description || '',
      location: product.location,
      lat: product.coordinates?.lat?.toString() || '',
      lng: product.coordinates?.lng?.toString() || '',
      image: product.image
    });
    // Set preview for uploaded images or base64
    if (product.image && (product.image.startsWith('/uploads/') || product.image.startsWith('data:') || product.image.startsWith('http'))) {
      const fullUrl = product.image.startsWith('/uploads/') ? `http://localhost:5000${product.image}` : product.image;
      setImagePreview(fullUrl);
    } else {
      setImagePreview(null);
    }
    setActivePage('sell');
  }, []);

  // Update existing product
  const handleUpdateProduct = useCallback(async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setLoading(true);

      const productData = {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        originalPrice: parseFloat(newProduct.originalPrice) || parseFloat(newProduct.price) * 1.5,
        image: newProduct.image, // Use the server URL, not the blob preview
        seller: editingProduct.seller,
        location: newProduct.location,
        condition: newProduct.condition,
        category: newProduct.category,
        description: newProduct.description
      };

      // Add coordinates if provided
      if (newProduct.lat && newProduct.lng) {
        productData.coordinates = {
          lat: parseFloat(newProduct.lat),
          lng: parseFloat(newProduct.lng)
        };
      }

      const response = await productAPI.update(editingProduct._id || editingProduct.id, productData);

      if (response.success) {
        // Update in local state
        setProducts(prev =>
          prev.map(p =>
            (p._id || p.id) === (editingProduct._id || editingProduct.id) ? response.data : p
          )
        );

        // Clean up blob URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }

        // Reset form
        setNewProduct({
          title: '',
          category: '',
          price: '',
          originalPrice: '',
          condition: 'Like New',
          description: '',
          location: '',
          lat: '',
          lng: '',
          image: '📦'
        });
        setImagePreview(null);
        setEditingProduct(null);

        alert('✅ Product updated successfully!');
        setActivePage('profile');
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editingProduct, newProduct, imagePreview]);

  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate UPI ID format if provided
      if (userProfile.upiId && userProfile.upiId.trim()) {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiRegex.test(userProfile.upiId)) {
          setError('Invalid UPI ID format. Example: yourname@paytm');
          setLoading(false);
          return;
        }
      }

      const { userAPI } = await import('./services/api');
      const data = await userAPI.updateProfile({
        name: userProfile.name,
        phone: userProfile.phone,
        location: userProfile.location,
        upiId: userProfile.upiId
      });

      if (data.success) {
        // Update local state with response data
        setUserProfile(data.user);
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        setIsEditingProfile(false);
        alert('✅ Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Auth handlers
  const handleAuthInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setAuthForm(prev => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        
        setAuthToken(data.token);
        setUserProfile(data.user);
        setIsAuthenticated(true);
        setActivePage('home');
        
        // Reset form
        setAuthForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', location: '' });
        
        alert('✅ Login successful!');
        // Products will be fetched automatically by useEffect when isAuthenticated becomes true
      } else {
        alert('❌ ' + (data.message || 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    //Validate Email

    if (authForm.email.endsWith('@kjei.edu.in')=== false){
      alert('⚠️ Please use your college email (ending with @kjei.edu.in) to sign up!');
      return;
    }

    // Validate passwords match
    if (authForm.password !== authForm.confirmPassword) {
      alert('⚠️ Passwords do not match!');
      return;
    }

    // Validate password strength
    if (authForm.password.length < 6) {
      alert('⚠️ Password must be at least 6 characters long!');
      return;
    }

    if (authForm.phone.length >10) {
      alert('⚠️ Phone number should not exceed 10 digits!');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone,
          location: authForm.location
        })
      });

      const data = await response.json();

      if (data.success) {
        setPendingEmail(authForm.email);
        setShowVerificationStep(true);
        
        if (data.testMode) {
          alert(`✅ Verification code sent!\n\nTest Mode: Your code is ${data.code}\n\nNote: Configure EMAIL_USER and EMAIL_PASS in backend/.env for real emails`);
        } else {
          alert('✅ Verification code sent to your email! Please check your inbox.');
        }
      } else {
        alert('❌ ' + (data.message || 'Signup failed'));
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('❌ Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      alert('⚠️ Please enter a valid 6-digit verification code!');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Account verified successfully! Please login.');
        setActivePage('login');
        
        // Reset states
        setShowVerificationStep(false);
        setVerificationCode('');
        setPendingEmail('');
        setAuthForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', location: '' });
      } else {
        alert('❌ ' + (data.message || 'Verification failed'));
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('❌ Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    setAuthToken(null);
    setUserProfile({ name: '', email: '', phone: '', location: '', upiId: '', initials: '' });
    setIsAuthenticated(false);
    setActivePage('login');
    setProducts([]);
  };

  // Get user's products
  const userProducts = useMemo(() => {
    // Filter products that belong to the current user based on email
    return products.filter(p => 
      p.sellerEmail === userProfile.email
    );
  }, [products, userProfile.email]);

  // Render Login Page
  const renderLoginPage = () => (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">Sign in to access your marketplace</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthInputChange}
                placeholder="your.email@example.com"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthInputChange}
                placeholder="Enter your password"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {loading ? '🔄 Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setActivePage('signup')}
                className="text-blue-600 font-semibold hover:text-cyan-600 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Signup Page
  const renderSignupPage = () => (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              {showVerificationStep ? 'Verify Your Email' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {showVerificationStep 
                ? `Enter the verification code sent to ${pendingEmail}` 
                : 'Join the campus marketplace community'}
            </p>
          </div>

          {/* Show Verification Form or Signup Form */}
          {showVerificationStep ? (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Verification Code *
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 text-center text-2xl tracking-widest font-mono"
                  required
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check your email inbox for the verification code. Code expires in 10 minutes.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationStep(false);
                    setVerificationCode('');
                    setPendingEmail('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className={`flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all ${
                    (loading || verificationCode.length !== 6) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  {loading ? '🔄 Verifying...' : '✅ Verify & Create Account'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthInputChange}
                  placeholder="John Doe"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  placeholder="your.email@example.com"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={authForm.confirmPassword}
                  onChange={handleAuthInputChange}
                  placeholder="Re-enter password"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={authForm.phone}
                  onChange={handleAuthInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Campus Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={authForm.location}
                  onChange={handleAuthInputChange}
                  placeholder="Hostel A-201"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {loading ? '🔄 Creating account...' : '✨ Create Account'}
            </button>
          </form>
          )}

          {/* Login Link */}
          {!showVerificationStep && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setActivePage('login')}
                  className="text-blue-600 font-semibold hover:text-cyan-600 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Home Page Content
  const renderHomePage = () => (
    <div className="space-y-10">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-1 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-cyan-400/20"></div>
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-600/90 via-cyan-600/90 to-blue-700/90 rounded-3xl p-12">
          <div className="max-w-3xl">
            <div className="inline-block mb-4">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg">
                🎓 Campus Community Marketplace
              </span>
            </div>
            <h2 className="text-5xl font-bold mb-4 text-white leading-tight">
              Discover Amazing Deals<br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent">
                Right On Campus
              </span>
            </h2>
            <p className="text-blue-50 mb-8 text-lg leading-relaxed">
              Buy and sell with fellow students. From textbooks to tech, find everything you need for campus life.
            </p>
            
            {/* Premium Search Bar */}
            <div className="relative max-w-2xl">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Search className="absolute left-5 text-gray-400 pointer-events-none" size={22} />
                <input
                  type="text"
                  placeholder="Search books, electronics, furniture, and more..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-14 pr-4 py-5 text-gray-800 text-lg focus:outline-none bg-transparent"
                />
                <button className="m-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
                  Search
                </button>
              </div>
            </div>
            
            {/* Active Filters */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <span className="text-blue-50 text-sm font-medium">Active Filters:</span>
                {searchQuery && (
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg flex items-center gap-2">
                    🔍 "{searchQuery}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg flex items-center gap-2">
                    📂 {selectedCategory}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-white underline hover:text-yellow-200 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{products.length}+</div>
                <div className="text-sm text-blue-100">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-blue-100">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.8★</div>
                <div className="text-sm text-blue-100">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Categories */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          Browse Categories
          <span className="text-sm font-normal text-gray-400">Popular on campus</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.name)}
              className={`group relative ${cat.color} rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                selectedCategory === cat.name ? 'ring-4 ring-blue-500 scale-105 shadow-2xl' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="text-sm font-bold text-gray-800">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Items */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            {searchQuery || selectedCategory ? 'Search Results' : 'Featured Items'}
            {(searchQuery || selectedCategory) && (
              <span className="text-lg font-normal text-gray-400 ml-2">
                ({filteredProducts.length} items)
              </span>
            )}
          </h3>
          <button className="text-blue-400 text-sm font-semibold hover:text-cyan-400 transition-colors">View All →</button>
        </div>
        
        {error && (
          <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-2">No products found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const productId = product._id || product.id;
              return (
            <div key={productId} className="group relative bg-gradient-to-br from-slate-800/90 to-blue-900/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-800/30 hover:border-blue-500/50">
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 h-48 flex items-center justify-center overflow-hidden">
                  {renderProductImage(product.image)}
                </div>
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(productId)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:scale-110 transition-all hover:bg-white"
                >
                  <Heart
                    size={18}
                    className={favorites.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                  />
                </button>
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
                
                {/* Category Badge */}
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                  {product.category}
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="font-bold text-white mb-2 line-clamp-2 text-base group-hover:text-cyan-300 transition-colors">{product.title}</h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">₹{product.price}</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs">{product.condition}</span>
                  </div>
                </div>
                
                {/* Quick View Button */}
                <button 
                  onClick={() => handleViewDetails(product)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 hover:from-blue-600 hover:to-cyan-600 text-blue-300 hover:text-white font-medium py-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-blue-500/30 hover:border-transparent"
                >
                  View Details
                </button>
              </div>
            </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderSellPage = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {editingProduct ? 'Edit Your Item' : 'List Your Item'}
            </h2>
            <p className="text-gray-600 mt-1">
              {editingProduct ? 'Update your product details' : 'Fill in the details to list your product on the marketplace'}
            </p>
          </div>
          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({
                  title: '',
                  category: '',
                  price: '',
                  originalPrice: '',
                  condition: 'Like New',
                  description: '',
                  location: '',
                  lat: '',
                  lng: '',
                  image: '📦'
                });
                setImagePreview(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={editingProduct ? handleUpdateProduct : handlePublishListing} className="space-y-6">
          {/* Premium Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Product Photos
              <span className="text-xs font-normal text-gray-500">(Required)</span>
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label 
              htmlFor="imageUpload"
              className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer block overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="mx-auto max-h-64 rounded-xl shadow-lg" />
                  <div className="mt-4 text-sm text-gray-600 font-medium">Click to change image</div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus size={40} className="text-white" />
                  </div>
                  <p className="text-gray-700 font-medium text-lg mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Product Title *</label>
              <input
                type="text"
                name="title"
                value={newProduct.title}
                onChange={handleSellInputChange}
                placeholder="e.g., Engineering Mathematics Textbook"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category *</label>
              <select 
                name="category"
                value={newProduct.category}
                onChange={handleSellInputChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Selling Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleSellInputChange}
                    placeholder="500"
                    className="w-full pl-10 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Original Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={newProduct.originalPrice}
                    onChange={handleSellInputChange}
                    placeholder="1000"
                    className="w-full pl-10 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Condition</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Like New', 'Excellent', 'Good', 'Fair'].map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setNewProduct(prev => ({ ...prev, condition: cond }))}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      newProduct.condition === cond
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleSellInputChange}
                rows="5"
                placeholder="Describe your item in detail... Include features, condition, reason for selling, etc."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Pickup Location *</label>
              <input
                type="text"
                name="location"
                value={newProduct.location}
                onChange={handleSellInputChange}
                placeholder="e.g., Campus Gate 2, Main Library, Hostel B"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={newProduct.lat || ''}
                  onChange={handleSellInputChange}
                  placeholder="e.g., 19.0760"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={newProduct.lng || ''}
                  onChange={handleSellInputChange}
                  placeholder="e.g., 72.8777"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-3">
              💡 Add coordinates for precise location tracking on maps. You can get these from Google Maps.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-bold py-5 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                {editingProduct ? 'Updating Your Listing...' : 'Publishing Your Listing...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {editingProduct ? '✏️ Update Listing' : '🚀 Publish Listing'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Premium Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-1 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20"></div>
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-cyan-600/90 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-blue-600 shadow-2xl">
                  {userProfile.initials}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{userProfile.name}</h2>
                <p className="text-blue-100 mb-1">{userProfile.email}</p>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
                  <MapPin size={14} />
                  <span>{userProfile.location}</span>
                </div>
                {userProfile.upiId ? (
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-xs font-semibold border border-green-400/30">
                    <span>✅</span>
                    <span>Payments Configured</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-xs font-semibold border border-orange-400/30">
                    <span>⚠️</span>
                    <span>Configure UPI to receive payments</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 text-white backdrop-blur-sm shadow-lg hover:scale-105"
            >
              <Edit2 size={18} />
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">{userProducts.length}</div>
              <div className="text-sm text-blue-100">Active Listings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">{favorites.length}</div>
              <div className="text-sm text-blue-100">Favorites</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">4.8★</div>
              <div className="text-sm text-blue-100">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">15</div>
              <div className="text-sm text-blue-100">Total Sales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Edit Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
              <input
                type="text"
                name="name"
                value={userProfile.name}
                onChange={handleProfileInputChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
              <input
                type="email"
                name="email"
                value={userProfile.email}
                onChange={handleProfileInputChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={userProfile.phone}
                onChange={handleProfileInputChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Campus Location</label>
              <input
                type="text"
                name="location"
                value={userProfile.location}
                onChange={handleProfileInputChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
          </div>
          
          {/* Payment Settings */}
          <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Payment Configuration</h4>
                <p className="text-sm text-gray-600">Configure your UPI ID to receive payments</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                UPI ID *
                <span className="ml-2 text-xs font-normal text-gray-500">(Required to receive payments)</span>
              </label>
              <input
                type="text"
                name="upiId"
                value={userProfile.upiId || ''}
                onChange={handleProfileInputChange}
                placeholder="yourname@upi"
                className="w-full px-5 py-4 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800 bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay, yourname@ybl)
              </p>
              {!userProfile.upiId && (
                <div className="mt-3 flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <span className="text-lg">⚠️</span>
                  <span>You won't be able to receive payments until you configure your UPI ID</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSaveProfile}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02]"
          >
            💾 Save Changes
          </button>
        </div>
      )}

      {/* My Listings */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            My Listings 
            <span className="ml-2 text-lg font-normal text-gray-500">({userProducts.length})</span>
          </h3>
          <button
            onClick={() => setActivePage('sell')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
        
        {userProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <Package size={40} className="text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">No listings yet</p>
            <p className="text-sm text-gray-500 mb-6">Start selling by creating your first listing</p>
            <button
              onClick={() => setActivePage('sell')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              🚀 List Your First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userProducts.map(product => {
              const productId = product._id || product.id;
              return (
                <div key={productId} className="group flex items-center gap-5 p-4 border-2 border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-300 transition-all bg-white">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                    {renderProductImage(product.image, 'small')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 mb-1 truncate">{product.title}</h4>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{product.category}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{product.condition}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:bg-blue-100 p-3 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(productId)}
                      className="text-red-600 hover:bg-red-100 p-3 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Received Orders (As Seller) */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            📦 Received Orders
            <span className="ml-2 text-lg font-normal text-gray-500">({receivedOrders.length})</span>
          </h3>
        </div>

        {receivedOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>No orders received yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedOrders.map(order => (
              <div key={order._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                      {renderProductImage(order.productImage, 'small')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{order.productTitle}</h4>
                      <p className="text-sm text-gray-600 mb-2">₹{order.productPrice}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>{order.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{order.buyerLocation}</span>
                      </div>
                      {order.message && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700"><strong>Message:</strong> {order.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-all"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
                
                {order.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedOrderForTracking(order);
                        setShowLocationTracker(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} />
                      📍 View Live Tracking
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all"
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Orders (As Buyer) */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            🛍️ My Orders
            <span className="ml-2 text-lg font-normal text-gray-500">({orders.length})</span>
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                      {renderProductImage(order.productImage, 'small')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{order.productTitle}</h4>
                      <p className="text-sm text-gray-600 mb-2">₹{order.productPrice}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>Seller: {order.sellerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>Pickup: {order.pickupLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="w-full mt-4 pt-4 border-t border-gray-200 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-all"
                  >
                    Cancel Order
                  </button>
                )}
                
                {order.status === 'accepted' && (
                  <button
                    onClick={() => {
                      setSelectedOrderForTracking(order);
                      setShowLocationTracker(true);
                    }}
                    className="w-full mt-4 pt-4 border-t border-gray-200 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    📍 View Live Tracking
                  </button>
                )}
                
                {order.status === 'completed' && order.payment?.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedOrderForPayment(order);
                      setShowPaymentModal(true);
                    }}
                    className="w-full mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    💳 Pay Now - ₹{order.productPrice}
                  </button>
                )}
                
                {order.status === 'completed' && order.payment?.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                      <CheckCircle size={20} />
                      <span>Payment Completed</span>
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-600">
                      {order.payment.paymentMethod === 'cash' ? (
                        <span>Paid via Cash</span>
                      ) : (
                        <span>Transaction ID: {order.payment.transactionId}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Notifications', desc: 'Manage notification preferences', icon: '🔔', color: 'from-blue-500 to-cyan-500', onClick: () => {} },
            { name: 'Privacy', desc: 'Control privacy settings', icon: '🔒', color: 'from-purple-500 to-pink-500', onClick: () => {} },
            { name: 'Payment Methods', desc: 'Configure UPI ID for payments', icon: '💳', color: 'from-green-500 to-emerald-500', onClick: () => setIsEditingProfile(true) },
            { name: 'Help & Support', desc: 'Get help or contact us', icon: '💬', color: 'from-orange-500 to-red-500', onClick: () => {} }
          ].map(item => (
            <button 
              key={item.name}
              onClick={item.onClick}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-white p-6 rounded-2xl transition-all hover:shadow-xl text-left border-2 border-gray-200 hover:border-transparent"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <span className="text-gray-800 font-bold block mb-1">{item.name}</span>
                  <span className="text-gray-600 text-sm">{item.desc}</span>
                </div>
                <span className="text-gray-400 text-2xl group-hover:translate-x-1 transition-transform">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Modern Glass Morphism Header */}
      <header className="backdrop-blur-xl bg-white/5 shadow-2xl sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Store size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                StudentMarket
              </h1>
            </div>

            {/* Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActivePage('home')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    activePage === 'home' 
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 shadow-lg shadow-blue-500/20' 
                      : 'text-gray-300 hover:text-blue-300 hover:bg-white/5'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActivePage('sell')}
                  className="ml-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Sell Item
                </button>
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setActivePage('profile')}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                  >
                    {userProfile.initials}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl font-medium hover:bg-red-500/30 transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {!isAuthenticated && activePage === 'login' && renderLoginPage()}
        {!isAuthenticated && activePage === 'signup' && renderSignupPage()}
        {isAuthenticated && activePage === 'home' && renderHomePage()}
        {isAuthenticated && activePage === 'sell' && renderSellPage()}
        {isAuthenticated && activePage === 'profile' && renderProfilePage()}
      </main>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <X size={20} />
              </button>

              {/* Product Image */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-16 text-center flex items-center justify-center min-h-[300px]">
                <div className="w-full h-full flex items-center justify-center">
                  {renderProductImage(selectedProduct.image, 'large')}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-8">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-3">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedProduct.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>Sold by: {selectedProduct.seller}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-bold text-blue-600">₹{selectedProduct.price}</span>
                  <span className="text-xl text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                    {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Condition:</span>
                    <span>{selectedProduct.condition}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">Rating:</span>
                    <span>{selectedProduct.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 col-span-2">
                    <MapPin size={16} />
                    <span className="font-medium">Pickup:</span>
                    <span>{selectedProduct.location}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Pickup Location Map Preview */}
                {selectedProduct.coordinates?.lat && selectedProduct.coordinates?.lng && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />
                      Pickup Location
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-600 text-white p-3 rounded-lg">
                          <MapPin size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 font-medium mb-2">{selectedProduct.pickupLocation}</p>
                          <p className="text-xs text-gray-500 mb-3">
                            📍 {selectedProduct.coordinates.lat.toFixed(6)}, {selectedProduct.coordinates.lng.toFixed(6)}
                          </p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedProduct.coordinates.lat},${selectedProduct.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                          >
                            <MapPin size={16} />
                            Open in Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Message */}
                {selectedProduct.sellerEmail !== userProfile.email && (
                  <div className="mb-6">
                    <label className="block font-bold text-gray-800 mb-2">Message to Seller (Optional)</label>
                    <textarea
                      value={orderMessage}
                      onChange={(e) => setOrderMessage(e.target.value)}
                      placeholder="e.g., When can I pick this up?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedProduct.sellerEmail === userProfile.email ? (
                    <div className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-xl text-center">
                      This is your product
                    </div>
                  ) : selectedProduct.isSold ? (
                    <div className="w-full bg-red-100 text-red-600 font-bold py-4 rounded-xl text-center">
                      Already Sold
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all ${
                          loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                        }`}
                      >
                        {loading ? '🔄 Placing Order...' : '🛒 Place Order'}
                      </button>
                      <button
                        onClick={() => toggleFavorite(selectedProduct._id)}
                        className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
                      >
                        <Heart
                          size={24}
                          className={favorites.includes(selectedProduct._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Tracker Modal */}
      {showLocationTracker && selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLocationTracker(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative p-8">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowLocationTracker(false);
                  setSelectedOrderForTracking(null);
                }}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <X size={20} />
              </button>

              {/* Order Info Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedOrderForTracking.productTitle}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedOrderForTracking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    selectedOrderForTracking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedOrderForTracking.status.toUpperCase()}
                  </span>
                  <span>Order ID: {selectedOrderForTracking._id}</span>
                </div>
              </div>

              {/* Location Tracker Component */}
              <LocationTracker
                orderId={selectedOrderForTracking._id}
                authToken={authToken}
                userRole={selectedOrderForTracking.buyerId === userProfile.email ? 'buyer' : 'seller'}
                orderStatus={selectedOrderForTracking.status}
                pickupCoordinates={selectedOrderForTracking.pickupCoordinates}
                onClose={() => {
                  setShowLocationTracker(false);
                  setSelectedOrderForTracking(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
          onPaymentComplete={(updatedOrder) => {
            // Refresh orders to show updated payment status
            fetchOrders();
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentMarketplace;