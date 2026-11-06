# 🌾 Smart Krushi Bazar (स्मार्ट कृषि बाज़ार)

A comprehensive, next-generation Agri-Tech full-stack marketplace connecting Farmers directly with Buyers, Agri-Experts, and Administrative moderation. Built with the MERN stack, Socket.io, Tailwind CSS, and AI-driven advisory features.

---

## 🚀 Key Features

- **Multi-Role Authentication**: JWT-based role protection (Farmer, Buyer, Expert, Admin).
- **Farmer Portal**:
  - Add & manage crop listings with instant image uploads.
  - Track orders with full status progression (Pending → Accepted → In Transit → Delivered).
  - Crop Disease Detection & AI Crop Advisory algorithms.
  - Digital Produce Passport & QR Code traceability.
- **Buyer Portal**:
  - Browse verified farm listings with live mandi price comparisons.
  - Cart, Wishlist, Bulk Demand requests, and Freight Estimation.
  - Secure Razorpay Payment integration (with automatic mock fallback simulator).
  - Real-time Order Tracking stepper & PDF invoice generation.
- **Direct Chat & Consultations**: Real-time Socket.io communication between farmers, buyers, and agriculture experts.
- **Live Mandi Prices & Weather**: Real-time mandi rates, trend tracking, and live weather forecast cards.
- **Admin Command Center**: Complete oversight of disputes, transaction logs, analytics, and user moderation.
- **Multilingual & PWA-ready**: Native English / Hindi / Gujarati language support with mobile-responsive design.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Socket.io-client, Axios, jsPDF, html2canvas.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, bcryptjs, Razorpay, Multer, Cloudinary.
- **Database**: MongoDB (Local or MongoDB Atlas for cloud deployment).

---

## 📂 Folder Structure

```text
smart-krushi-bazar/
├── backend/                  # Express REST API, Socket.io, Models, Controllers, Routes
│   ├── src/
│   │   ├── controllers/      # Handlers for auth, orders, products, mandi, chat, etc.
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # External integrations & business logic
│   │   └── server.js         # Entry point & socket initialization
│   └── uploads/              # Local media storage
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── components/       # Reusable UI widgets, Modals, Navbar, Footer
│   │   ├── context/          # Auth, Cart, Socket, Theme, Language contexts
│   │   ├── pages/            # Farmer, Buyer, Expert, Admin views
│   │   └── services/         # Axios API clients & WebSocket managers
│   └── dist/                 # Production build output
├── database/                 # Exported MongoDB collections & seed assets
├── DEPLOYMENT_GUIDE.md       # Comprehensive cloud deployment instructions
└── README.md
```

---

## ⚙️ Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js** (v18.0 or newer)
- **MongoDB** (Local Community Server running on `127.0.0.1:27017` or a MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs by default on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs by default on `http://localhost:5173`*

---

## 🔑 Environment Variables

**backend/.env** (reference `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_krushi_bazar
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
# Optional: Razorpay & Cloudinary keys
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**frontend/.env** (reference `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Cloud Deployment

Refer to [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for full step-by-step instructions to deploy:
- **Database**: Free MongoDB Atlas M0 cluster
- **Backend API**: Render.com or Railway
- **Frontend SPA**: Vercel or Netlify (with SPA rewrite support via `vercel.json`)
