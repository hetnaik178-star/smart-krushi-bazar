# 🌾 Smart Krushi Bazar - Version 1

A full-stack agricultural marketplace connecting Farmers directly with Buyers. Built as a college-level MERN stack project.

## 🚀 Features
- **Authentication**: JWT-based login/register with role-based access (Farmer/Buyer).
- **Farmer Portal**: Add, edit, delete products; view and manage incoming orders (Pending → Accepted → Completed).
- **Buyer Portal**: Browse, search, and filter products; place direct "Buy Now" orders; track order status.
- **Stock Management**: Automatically decreases product quantity upon successful order. Prevents negative stock.
- **Responsive UI**: Clean, green-themed Tailwind CSS design for mobile and desktop.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Database**: Persistent Local MongoDB (`smart_krushi_bazar`)

## 📂 Folder Structure
```text
smart-krushi-bazar/
├── backend/          # Express API, Models, Controllers, Routes
├── frontend/         # React Vite App, Components, Pages, Context
└── README.md
```

---

## 🛠️ DEVELOPMENT-README (Local MongoDB Setup & Guide)

### 1. How to Install MongoDB on Windows
1. Download **MongoDB Community Server** (MSI Installer) from the official website:
   👉 [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the `.msi` setup wizard.
3. Select **"Complete"** installation type.
4. Keep **"Install MongoDB as a Service"** checked (this allows MongoDB to run in the background automatically).
5. Check **"Install MongoDB Compass"** (Graphical UI tool to visually inspect database collections).
6. Complete the installation.

### 2. How to Start / Verify MongoDB on Windows
- **Via Windows Services**:
  1. Press `Win + R`, type `services.msc`, and press Enter.
  2. Find **MongoDB Server** in the list.
  3. Ensure its status is **Running**. (If stopped, right-click and click **Start**).
- **Via Command Prompt / PowerShell (Run as Administrator)**:
  ```powershell
  net start MongoDB
  ```

### 3. Connection String
- **Default Connection String**: `mongodb://127.0.0.1:27017/smart_krushi_bazar`
- **Database Name**: `smart_krushi_bazar`

### 4. How to Inspect Database via MongoDB Compass
1. Open **MongoDB Compass** from your Windows Start Menu.
2. In the **New Connection** field, enter:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. You will see the `smart_krushi_bazar` database in the left sidebar with the following collections:
   - `users` (Farmer & Buyer registered accounts)
   - `products` (Agricultural produce listings)
   - `orders` (Purchase transactions)

---

## ⚙️ Installation & Running the Application

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend will connect to `mongodb://127.0.0.1:27017/smart_krushi_bazar` and run on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run on `http://localhost:5173`*

---

## 🔑 Environment Variables
**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_krushi_bazar
JWT_SECRET=super_secret_college_project_key_123
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎓 College Demo Workflow (5 Minutes)
1. **Register as Farmer**: Create account → Login → Dashboard.
2. **Add Product**: Click "Add New Product" → Fill details (e.g., Tomato, Vegetables, ₹30, Qty: 50) → Save.
3. **Logout**.
4. **Register as Buyer**: Create account → Login → Dashboard.
5. **Browse & Buy**: Go to Products → Search "Tomato" → Click "View Details" → Enter Qty: 5 → Click "Buy Now".
6. **Check Order**: Go to "View My Orders" → See status "Pending".
7. **Logout & Login as Farmer**: Go to "View Received Orders" → See the new order → Change status to "Accepted" → Then "Mark Completed".
8. **Verify**: Switch back to Buyer → Check "My Orders" → Status is now "Completed".

---

## 🚫 Out of Scope (V1)
Payment gateways, real-time chat, AI features, weather APIs, and complex admin panels are intentionally excluded to maintain a focused, working MVP suitable for college evaluation.
