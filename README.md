# 🎓 CampusCommerce - Student Marketplace# React + Vite
A full-stack MERN application for buying and selling items within a campus community.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Step 1: Setup MongoDB

**Local MongoDB**
```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community
```

### Step 2: Setup Backend
```bash
cd backend
npm install
```

**Configure Environment Variables:**

Copy the example file and edit it:
```bash
cp .env.example .env
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable documentation.

Quick setup - update `.env` with:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/campuscommerce
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com  # Optional
EMAIL_PASS=your_app_password      # Optional
```

Then run:
```bash
npm run seed    # Add sample data (optional but recommended)
npm run dev     # Start backend server
```

✅ Backend should now be running on **http://localhost:5000**

### Step 3: Setup Frontend
Open a **new terminal**:
```bash
cd frontend
npm install
```

**Configure Environment Variables:**

Copy the example file and edit it:
```bash
cp .env.example .env
```

Update `.env` with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here  # Optional
```

**Note:** See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration guide.

Then start the frontend:
```bash
npm run dev
```

✅ Frontend should now be running on **http://localhost:5173**

### Step 4: Test the Application
1. Open browser to http://localhost:5173
2. Try searching for products
3. Click categories to filter
4. Click "Sell Item" to list a new product
5. Fill the form and publish!

## ✨ Features

- 🔍 **Search & Filter** - Real-time search and category filtering
- 📦 **Sell Items** - List items with image upload and pickup location
- ❤️ **Favorites** - Mark products as favorites
- 📱 **Responsive Design** - Modern UI with gradient theme
- 🔄 **Live Updates** - Dynamic product listings from database
- 🔐 **Authentication** - Secure user registration with email verification
- 📍 **Location Tracking** - Live GPS tracking for buyer-seller meetups
- 🗺️ **Google Maps Integration** - Visual pickup location and live tracking
- 📦 **Order Management** - Complete order lifecycle with status tracking
- 💳 **UPI Payments** - Integrated UPI payment system with deep links
- 💰 **Multiple Payment Methods** - Support for UPI and cash payments

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS 4
- Lucide React (icons)
- Axios (API client)

**Backend:**
- Express.js
- MongoDB + Mongoose
- CORS enabled
- RESTful API

## 📡 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-email` | Verify email with code |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile (auth required) |
| PUT | `/api/auth/profile` | Update user profile (auth required) |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products?search=laptop` | Search products |
| GET | `/api/products?category=Books` | Filter by category |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product (auth required) |
| PUT | `/api/products/:id` | Update product (auth required) |
| DELETE | `/api/products/:id` | Delete product (auth required) |
| PATCH | `/api/products/:id/sold` | Mark as sold (auth required) |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order (auth required) |
| GET | `/api/orders/buyer` | Get orders as buyer (auth required) |
| GET | `/api/orders/seller` | Get orders as seller (auth required) |
| PATCH | `/api/orders/:id/status` | Update order status (auth required) |
| DELETE | `/api/orders/:id` | Cancel order (auth required) |

### 📍 Location Tracking Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/:orderId/enable-tracking` | Enable live tracking for an order |
| PATCH | `/api/orders/:orderId/update-location` | Update buyer/seller location |
| GET | `/api/orders/:orderId/tracking` | Get live tracking data |

### 💳 Payment Endpoints (NEW)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/:orderId/initiate` | Get payment details (UPI ID, amount) |
| POST | `/api/payments/:orderId/complete` | Mark UPI payment as complete |
| POST | `/api/payments/:orderId/cash` | Mark cash payment as complete |
| GET | `/api/payments/:orderId/status` | Get payment status |

## 🎨 UI Theme

- **Background**: Blue-black gradient (`from-slate-900 via-blue-900 to-slate-900`)
- **Primary**: Blue to cyan gradients
- **Cards**: Dark slate with blue tones
- **Hover Effects**: Glow and scale transitions

## 📝 Project Commands

**Backend:**
```bash
npm start       # Production mode
npm run dev     # Development with nodemon
npm run seed    # Seed database with sample data
```

**Frontend:**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## � Live Location Tracking

CampusCommerce includes a real-time location tracking feature for safe buyer-seller meetups.

### How It Works

1. **Seller Sets Pickup Location**
   - When creating a product listing, seller selects a pickup location on Google Maps
   - Coordinates are saved with the product

2. **Buyer Places Order**
   - Buyer can see the predefined pickup location on the map
   - Order is sent to seller for approval

3. **Seller Accepts Order**
   - When seller accepts, live tracking is automatically enabled
   - Both parties receive a "Track Location" button

4. **Real-time Tracking**
   - Both buyer and seller can see each other's live location
   - Locations update every 10 seconds
   - Three markers shown: pickup point (📍), buyer (🔵), seller (🔴)

5. **Complete Transaction**
   - When seller marks order as completed, tracking automatically stops

### Security Features

- ✅ Location sharing only enabled after seller approval
- ✅ Tracking stops when order is completed/cancelled
- ✅ Both parties must grant browser location permissions
- ✅ Location data is temporary and tied to active orders

### Usage Example

```javascript
// Enable tracking when order is accepted
POST /api/orders/:orderId/enable-tracking
{
  "pickupCoordinates": {
    "lat": 28.7041,
    "lng": 77.1025
  }
}

// Update your location (buyer or seller)
PATCH /api/orders/:orderId/update-location
{
  "lat": 28.7042,
  "lng": 77.1026
}

// Get current tracking status
GET /api/orders/:orderId/tracking
// Returns: { buyerLocation, sellerLocation, pickupCoordinates, enabled }
```

### Browser Permissions

The app requires **Geolocation** permission for live tracking. Users will see a browser prompt:
- ✅ Allow → Live tracking works
- ❌ Block → Fallback message shown

**Note:** Geolocation requires HTTPS in production or localhost for development.

## �🐛 Troubleshooting

**MongoDB Connection Error:**
```
❌ connect ECONNREFUSED 127.0.0.1:27017
```
- Solution: Start MongoDB or use MongoDB Atlas (see `MONGODB_SETUP.md`)

**CORS Error:**
- Ensure backend is running on port 5000
- Check frontend is making requests to correct URL

**Port Already in Use:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

**Google Maps Not Loading:**
- ✅ Check `.env` file has `VITE_GOOGLE_MAPS_API_KEY`
- ✅ Restart frontend dev server after adding .env
- ✅ Verify API key is enabled in Google Cloud Console
- ✅ Enable "Maps JavaScript API" and "Geocoding API"

**Location Tracking Not Working:**
- ✅ Grant browser location permissions
- ✅ Use HTTPS or localhost (required for geolocation)
- ✅ Ensure order is accepted by seller
- ✅ Check network connection for location updates

**Email Verification Not Sending:**
- ✅ Configure `EMAIL_USER` and `EMAIL_PASS` in backend `.env`
- ✅ Use Gmail App Password (not regular password)
- ✅ Enable "Less secure app access" or use OAuth2

## 📂 Directory Structure

```
CampusCommerce/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx        # Login form
│   │   │   │   └── SignupPage.jsx       # Signup & verification
│   │   │   ├── home/
│   │   │   │   └── HomePage.jsx         # Product browsing
│   │   │   ├── shared/
│   │   │   │   └── Header.jsx           # Navigation bar
│   │   │   └── LocationTracker.jsx      # Live tracking component
│   │   ├── services/
│   │   │   └── api.js                   # API service
│   │   ├── StudentMarketplace.jsx       # Main app container
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                             # Google Maps API key
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/
│   │   ├── Product.js                   # Product schema + coordinates
│   │   ├── Order.js                     # Order schema + tracking
│   │   ├── User.js                      # User authentication
│   │   └── VerificationCode.js          # Email verification
│   ├── controllers/
│   │   ├── productController.js         # Product logic
│   │   └── orderController.js           # Order + tracking logic
│   ├── routes/
│   │   ├── productRoutes.js             # Product API
│   │   ├── orderRoutes.js               # Order + tracking API
│   │   ├── authRoutes.js                # Authentication API
│   │   └── uploadRoutes.js              # Image upload
│   ├── middleware/
│   │   └── auth.js                      # JWT authentication
│   ├── utils/
│   │   └── emailService.js              # Email verification
│   ├── uploads/                         # Uploaded images
│   ├── server.js                        # Express server
│   ├── seed.js                          # Database seeder
│   ├── .env                             # Environment variables
│   └── package.json
├── README.md                            # This file
├── MONGODB_SETUP.md                     # MongoDB guide
├── QUICK_START.md                       # Quick start guide
└── REFACTORING_PLAN.md                  # Component structure
```
