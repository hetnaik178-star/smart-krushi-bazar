# 🚀 Smart Krushi Bazar - Complete Production Deployment Guide

This document outlines the step-by-step procedure to deploy the **Smart Krushi Bazar** full-stack web application to production.

---

## 📋 Readiness Summary

| Component | Status | Details |
| :--- | :--- | :--- |
| **Frontend Code** | ✅ **Ready** | `npm run build` succeeds with 0 errors. Dynamic `VITE_API_URL` configured. |
| **SPA Routing** | ✅ **Ready** | `vercel.json` configured with rewrite rules to prevent 404s on page refresh. |
| **Backend API** | ✅ **Ready** | Express + Socket.io server with dynamic `process.env.PORT` & CORS. |
| **Payment Gateway** | ✅ **Ready** | Real Razorpay integration + Automatic Mock Simulator fallback when keys are absent. |
| **Node Engine** | ✅ **Ready** | `engines: { "node": ">=18.0.0" }` added in package.json files. |
| **Database** | ⚠️ **Action Needed** | Local MongoDB (`127.0.0.1:27017`) must be replaced with a cloud database (**MongoDB Atlas**) in production. |

---

## 🗄️ Step 1: Cloud Database (MongoDB Atlas - 100% Free)

Because production servers cannot access your local PC's MongoDB, you need a free cloud MongoDB database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in/up.
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user (username and password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** → **Drivers** → Copy your connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_krushi_bazar?retryWrites=true&w=majority
   ```
6. *(Optional: To copy local data to Atlas)* You can export your local database using `mongodump` and restore it using `mongorestore`, or simply let the application seed demo data directly via the Admin Console (**1-Click Viva Demo Reset**).

---

## 🌐 Step 2: Backend Deployment (Render / Railway)

### Recommended: [Render.com](https://render.com) (Free Tier Available)

1. Push your repository to **GitHub**.
2. Sign in to Render and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service settings:
   - **Name:** `smart-krushi-bazar-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add the following **Environment Variables** in Render's dashboard:
   - `MONGODB_URI`: *[Your MongoDB Atlas connection string from Step 1]*
   - `JWT_SECRET`: *[A long random secret string, e.g., `skb_prod_secret_key_998877`]*
   - `FRONTEND_URL`: `*` *(or your Vercel URL once frontend is deployed)*
   - `NODE_ENV`: `production`
   - *(Optional)* `RAZORPAY_KEY_ID`: *[Your Razorpay Key ID, or leave blank for simulator]*
   - *(Optional)* `RAZORPAY_KEY_SECRET`: *[Your Razorpay Key Secret, or leave blank for simulator]*
   - *(Optional)* `CLOUDINARY_CLOUD_NAME`: *[Cloudinary cloud name]*
   - *(Optional)* `CLOUDINARY_API_KEY`: *[Cloudinary API key]*
   - *(Optional)* `CLOUDINARY_API_SECRET`: *[Cloudinary API secret]*
6. Click **Create Web Service**. Wait 2-3 minutes for deployment to complete.
7. Copy your backend URL: e.g., `https://smart-krushi-bazar-backend.onrender.com`.

---

## 💻 Step 3: Frontend Deployment (Vercel)

### Recommended: [Vercel.com](https://vercel.com) (Free & Instant)

1. Sign in to Vercel and click **Add New...** → **Project**.
2. Import the same GitHub repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://smart-krushi-bazar-backend.onrender.com/api` *(Make sure to append `/api` at the end!)*
5. Click **Deploy**. Vercel will build and deploy your app in ~1 minute.
6. Your live website URL will be ready (e.g., `https://smart-krushi-bazar.vercel.app`)!

---

## 🔒 Step 4: Final Linkup & Verification

1. Go back to your backend service in **Render** and update `FRONTEND_URL` to your live Vercel domain (e.g. `https://smart-krushi-bazar.vercel.app`).
2. Open your live Vercel website in the browser.
3. Verify:
   - **Sign Up / Login** works (connects to cloud database).
   - **Admin Console**: Log in with admin credentials and click **⚡ Viva Demo Reset** to populate sample farmers, crops, and orders instantly!
   - **Order & Payment Flow**: Test Buy Now / Cart checkout.
   - **Live Mandi & Weather**: Verify data feeds load seamlessly.
   - **Language Toggle**: Verify multilingual features (English / Hindi / Gujarati).

---

## 🛠️ Summary Checklist for Deployment

- [x] Frontend builds with 0 errors (`npm run build` verified).
- [x] All API endpoints point dynamically to `VITE_API_URL`.
- [x] SPA client-side routing configured (`vercel.json`).
- [x] Fallback for Mock Razorpay payment in place.
- [ ] Create free MongoDB Atlas cluster & grab connection string.
- [ ] Deploy backend to Render / Railway with Atlas connection string.
- [ ] Deploy frontend to Vercel with `VITE_API_URL` set to your backend URL + `/api`.
