import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './utils/ProtectedRoute';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import DynamicAgroBackground from './components/DynamicAgroBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Pages - Core & Marketplace
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

// Pages - Farmer
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduct from './pages/farmer/AddProduct';
import MyProducts from './pages/farmer/MyProducts';
import EditProduct from './pages/farmer/EditProduct';
import FarmerOrders from './pages/farmer/FarmerOrders';
import AnalyticsPage from './pages/farmer/AnalyticsPage';
import FarmerConsultations from './pages/farmer/FarmerConsultations';
import DiseaseDetection from './pages/farmer/DiseaseDetection';

// Pages - Expert
import ExpertDashboard from './pages/expert/ExpertDashboard';
import ExpertMessages from './pages/expert/ExpertMessages';
import ExpertConsultations from './pages/expert/ExpertConsultations';
import ConsultationBooking from './pages/expert/ConsultationBooking';

// Pages - Buyer
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import MyOrders from './pages/buyer/MyOrders';
import WishlistPage from './pages/buyer/WishlistPage';
import CartPage from './pages/buyer/CartPage';
import Checkout from './pages/buyer/Checkout';
import OrderCheckout from './pages/buyer/OrderCheckout';
import MyDisputes from './pages/buyer/MyDisputes';
import BulkDemand from './pages/buyer/BulkDemand';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDisputes from './pages/admin/AdminDisputes';

// Pages - Profiles & Identity
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import FarmerPublicProfile from './pages/FarmerPublicProfile';

// Pages - V4 Innovation Features
import Experts from './pages/Experts';
import ExpertProfile from './pages/ExpertProfile';
import MandiPrices from './pages/MandiPrices';
import Chat from './pages/Chat';
import CropRecommendation from './pages/CropRecommendation';
import FertilizerCalculator from './pages/FertilizerCalculator';
import GovtSchemes from './pages/GovtSchemes';
import DigitalPassport from './pages/DigitalPassport';
import FreightEstimator from './pages/FreightEstimator';

// Wrapper for page fade-in transitions on route change
const PageTransitionWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-fade-in flex-grow flex flex-col">
      {children}
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const isStandalonePassport = location.pathname.startsWith('/passport') || location.pathname.startsWith('/verify');

  useEffect(() => {
    // Detect server network IP so invoice QR codes work when scanned by phones on Wi-Fi / Hotspot
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.networkIp && data.networkIp !== 'localhost') {
          window.__DETECTED_NETWORK_IP__ = data.networkIp;
          try { sessionStorage.setItem('detected_network_ip', data.networkIp); } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`relative flex flex-col min-h-screen ${isStandalonePassport ? 'bg-slate-950 text-slate-100' : 'bg-transparent text-surface-900'} selection:bg-emerald-500 selection:text-white`}>
      {!isStandalonePassport && <DynamicAgroBackground />}
      <Toaster position="top-center" reverseOrder={false} />
      {!isStandalonePassport && <Navbar />}
      <PageTransitionWrapper>
        <main className={`relative z-10 flex-grow flex flex-col w-full max-w-full overflow-x-hidden ${isStandalonePassport ? 'p-0 m-0' : 'pb-20 lg:pb-0'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/farmers/:id" element={<FarmerPublicProfile />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/:id" element={<ExpertProfile />} />
            <Route path="/mandi" element={<MandiPrices />} />

            {/* V4 Innovation Public Features */}
            <Route path="/crop-advisor" element={<CropRecommendation />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/fertilizer-calc" element={<FertilizerCalculator />} />
            <Route path="/fertilizer-calculator" element={<FertilizerCalculator />} />
            <Route path="/schemes" element={<GovtSchemes />} />
            <Route path="/govt-schemes" element={<GovtSchemes />} />
            <Route path="/freight-calc" element={<FreightEstimator />} />
            <Route path="/logistics-calc" element={<FreightEstimator />} />
            <Route path="/passport/:orderId" element={<DigitalPassport />} />
            <Route path="/passport" element={<DigitalPassport />} />
            <Route path="/verify/:orderId" element={<DigitalPassport />} />
            <Route path="/verify" element={<DigitalPassport />} />

            {/* Authenticated Global Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Farmer', 'Buyer', 'Admin', 'Expert']} />}>
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/chat" element={<Chat />} />
            </Route>

            {/* Farmer Specific Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/add-product" element={<AddProduct />} />
              <Route path="/farmer/my-products" element={<MyProducts />} />
              <Route path="/farmer/edit-product/:id" element={<EditProduct />} />
              <Route path="/farmer/orders" element={<FarmerOrders />} />
              <Route path="/farmer/analytics" element={<AnalyticsPage />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/experts/:expertId/book" element={<ConsultationBooking />} />
              <Route path="/consultation/book/:expertId" element={<ConsultationBooking />} />
            </Route>

            {/* Farmer & Expert Shared Consultations Route */}
            <Route element={<ProtectedRoute allowedRoles={['Farmer', 'Expert']} />}>
              <Route path="/farmer/consultations" element={<FarmerConsultations />} />
            </Route>

            {/* Expert Specific Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Expert']} />}>
              <Route path="/expert/dashboard" element={<ExpertDashboard />} />
              <Route path="/expert/consultations" element={<ExpertConsultations />} />
              <Route path="/expert/messages" element={<ExpertMessages />} />
            </Route>

            {/* Buyer Specific Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Buyer']} />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/bulk-demand" element={<BulkDemand />} />
              <Route path="/buyer/orders" element={<MyOrders />} />
              <Route path="/buyer/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/buyer/checkout" element={<Checkout />} />
              <Route path="/checkout/order/:orderId" element={<OrderCheckout />} />
              <Route path="/buyer/checkout/order/:orderId" element={<OrderCheckout />} />
              <Route path="/buyer/disputes" element={<MyDisputes />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
            </Route>
          </Routes>
        </main>
      </PageTransitionWrapper>
      {!isStandalonePassport && <Footer />}
      {!isStandalonePassport && <MobileBottomNav />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user opens a direct passport/verification QR scan on phone, skip splash screen immediately
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/passport') || path.startsWith('/verify')) {
        setIsLoading(false);
        return;
      }
    }
    const hasVisited = sessionStorage.getItem('krushi_visited');
    if (hasVisited) setIsLoading(false);
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('krushi_visited', 'true');
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Router>
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </Router>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
