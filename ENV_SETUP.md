# Environment Variables Configuration

This document explains all the environment variables used in the CampusCommerce application.

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

### Required Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/campuscommerce
```
- **Description**: MongoDB connection string
- **Default**: `mongodb://127.0.0.1:27017/campuscommerce`
- **Note**: Update this for production with your MongoDB Atlas or other hosted database URL

```env
# Server Configuration
PORT=5000
```
- **Description**: Port number for the backend server
- **Default**: `5000`
- **Note**: Make sure this port is available and matches the frontend API URL

```env
# JWT Secret for Authentication
JWT_SECRET=your-secret-key-change-in-production
```
- **Description**: Secret key for signing JWT tokens
- **Default**: `your-secret-key-change-in-production`
- **⚠️ IMPORTANT**: Change this to a strong, random string in production!
- **Tip**: Generate a secure key using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Optional Variables

```env
# Email Configuration (Optional - for email verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```
- **Description**: Gmail credentials for sending verification emails
- **Default**: None (app runs in test mode without these)
- **Note**: For Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your regular password
- **Test Mode**: If not configured, verification codes will be shown in console logs

---

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

### Required Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```
- **Description**: Base URL for backend API calls
- **Default**: `http://localhost:5000/api`
- **Note**: Update this in production to your deployed backend URL
- **Example Production**: `https://api.campuscommerce.com/api`

### Optional Variables

```env
# Google Maps API Key (Optional - for location features)
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```
- **Description**: Google Maps API key for location features
- **Default**: None (location features will be disabled)
- **How to get**: Visit [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
- **Required APIs**:
  - Maps JavaScript API
  - Maps Embed API
  - Geolocation API

---

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and update the values:
   ```bash
   nano .env  # or use your preferred editor
   ```

4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and update the values:
   ```bash
   nano .env  # or use your preferred editor
   ```

4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

---

## Production Considerations

### Backend

1. **JWT_SECRET**: MUST be changed to a strong, random string
2. **MONGODB_URI**: Update to your production database (MongoDB Atlas recommended)
3. **PORT**: Can be set by your hosting provider (e.g., Heroku, Railway)
4. **EMAIL_USER/EMAIL_PASS**: Configure for production email service

### Frontend

1. **VITE_API_URL**: Update to your deployed backend URL
2. **VITE_GOOGLE_MAPS_API_KEY**: Set up API key restrictions in Google Cloud Console

---

## Security Notes

⚠️ **NEVER commit `.env` files to version control!**

- The `.env` files are already in `.gitignore`
- Only share `.env.example` files
- Use different credentials for development and production
- Regularly rotate sensitive credentials like JWT_SECRET

---

## Troubleshooting

### Backend won't start
- Check if MongoDB is running locally: `mongod --version`
- Verify MONGODB_URI is correct
- Ensure PORT is not already in use

### Frontend API calls fail
- Verify VITE_API_URL matches your backend URL
- Check if backend server is running
- Look for CORS errors in browser console

### Email verification not working
- Check if EMAIL_USER and EMAIL_PASS are set correctly
- For Gmail, ensure you're using an App Password
- Check backend console logs for email-related errors

---

## Environment Variable Fallbacks

The application includes sensible defaults for most variables:

| Variable | Fallback Value |
|----------|---------------|
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/campuscommerce` |
| `JWT_SECRET` | `your-secret-key-change-in-production` |
| `VITE_API_URL` | `http://localhost:5000/api` |
| `EMAIL_USER` | None (test mode) |
| `EMAIL_PASS` | None (test mode) |
| `VITE_GOOGLE_MAPS_API_KEY` | None (feature disabled) |

This means the app can run even without a `.env` file, but production deployments **MUST** configure these properly.
