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

Create/Update `.env` file with your MongoDB URI:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campuscommerce
PORT=5000
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
- 📦 **Sell Items** - List items with image upload
- ❤️ **Favorites** - Mark products as favorites
- 📱 **Responsive Design** - Modern UI with gradient theme
- 🔄 **Live Updates** - Dynamic product listings from database

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products?search=laptop` | Search products |
| GET | `/api/products?category=Books` | Filter by category |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH | `/api/products/:id/sold` | Mark as sold |

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

## 🐛 Troubleshooting

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

## 📂 Directory Structure

```
CampusCommerce/
├── frontend/
│   ├── src/
│   │   ├── StudentMarketplace.jsx  # Main component
│   │   ├── services/
│   │   │   └── api.js              # API service
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/
│   │   └── Product.js              # MongoDB schema
│   ├── controllers/
│   │   └── productController.js    # Business logic
│   ├── routes/
│   │   └── productRoutes.js        # API routes
│   ├── server.js                   # Express server
│   ├── seed.js                     # Database seeder
│   ├── .env                        # Environment variables
│   └── package.json
└── MONGODB_SETUP.md                # MongoDB guide
```
