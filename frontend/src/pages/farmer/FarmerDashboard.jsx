import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaClock, FaCheckCircle, FaPlus, FaChartLine, FaRupeeSign, FaSeedling, FaMicroscope, FaUserMd } from 'react-icons/fa';
import { getMyProducts, getFarmerOrders } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import WeatherCard from '../../components/WeatherCard';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const finalValue = parseInt(value.toString().replace(/,/g, ''), 10) || 0;

    if (finalValue === 0) {
      setDisplayValue(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * finalValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(finalValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatCard = ({ icon: Icon, label, value, trend, color, gradient, staggerClass }) => {
  const isCurrency = typeof value === 'string' && value.startsWith('₹');
  const numValue = isCurrency ? value.substring(1) : value;

  return (
    <div className={`card-luxe p-5 relative overflow-hidden group ${staggerClass}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient || 'bg-gradient-to-tr from-brand-700 to-emerald-500'}`}>
        <Icon className="text-lg group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-black text-surface-900 font-display">
          {isCurrency && '₹'}<AnimatedNumber value={numValue} />
        </p>
        {trend && <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="text-xs text-surface-500 font-semibold mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
};

const FarmerDashboard = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProducts().then(setProducts).catch(() => {}),
      getFarmerOrders().then(setOrders).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : (products?.products || []);
  const pending = safeOrders.filter(o => o.status === 'Pending').length;
  const completed = safeOrders.filter(o => o.status === 'Completed').length;
  const revenue = safeOrders.filter(o => o.status === 'Completed' || o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('common.goodMorning', 'Good Morning'), emoji: '🌅' };
    if (hour < 18) return { text: t('common.goodAfternoon', 'Good Afternoon'), emoji: '☀️' };
    return { text: t('common.goodEvening', 'Good Evening'), emoji: '🌙' };
  };

  const greeting = getGreeting();
  // Attempt to get user from local storage
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Farmer' };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 page-fade-in">
      <div className="bg-gradient-to-r from-brand-600 to-emerald-400 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-8 text-white shadow-premium animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display mb-1 animate-slide-left">
              {greeting.text}, {user.name}! {greeting.emoji}
            </h1>
            <p className="text-emerald-50 text-xs sm:text-sm font-medium animate-slide-left stagger-1">
              {t('farmer.dashboardSubtitle', 'Welcome back to your farm operations dashboard.')}
            </p>
          </div>
          <Link to="/farmer/add-product" className="btn-saas-secondary bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-sm animate-slide-right text-xs py-2 px-4 w-full sm:w-auto text-center justify-center">
            <FaPlus className="text-xs" /> {t('farmer.addNewHarvest', 'List New Crop')}
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 gap-2 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5 sm:mb-2">
            <FaSeedling className="text-emerald-600" /> {t('farmer.dashboardTitle', 'Farmer Control Console')}
          </div>
          <h2 className="page-heading">{t('farmer.dashboardTitle', 'Farm Operations Hub')}</h2>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5 sm:mt-1">{t('farmer.dashboardSubtitle', 'Real-time inventory management, dispatches, and market logistics.')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-5 sm:mb-8">
        <StatCard icon={FaRupeeSign} label={t('farmer.totalRevenue', 'Settled Revenue')} value={`₹${revenue}`} gradient="bg-gradient-to-tr from-emerald-800 to-brand-600" trend="Direct Trade" staggerClass="stagger-1 animate-slide-up" />
        <StatCard icon={FaBox} label={t('farmer.activeListings', 'Active Listings')} value={safeProducts.length} gradient="bg-gradient-to-tr from-blue-700 to-indigo-500" staggerClass="stagger-2 animate-slide-up" />
        <StatCard icon={FaClock} label={t('farmer.pendingDispatches', 'Pending Orders')} value={pending} gradient="bg-gradient-to-tr from-amber-600 to-harvest-500" staggerClass="stagger-3 animate-slide-up" />
        <StatCard icon={FaCheckCircle} label={t('orders.delivered', 'Dispatches Done')} value={completed} gradient="bg-gradient-to-tr from-brand-700 to-teal-500" staggerClass="stagger-4 animate-slide-up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 animate-slide-up stagger-5">
        <div className="lg:col-span-2 card-luxe overflow-hidden shadow-2xl">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50/70">
            <h2 className="font-bold text-surface-900 text-xs sm:text-sm font-display">{t('farmer.recentOrders', 'Recent Inbound Orders')}</h2>
            <Link to="/farmer/orders" className="text-xs text-brand-700 font-bold hover:underline">{t('common.viewAll', 'View all orders →')}</Link>
          </div>

          {/* Mobile Cards for Recent Orders (< sm) */}
          <div className="block sm:hidden divide-y divide-surface-100 p-3 space-y-2.5">
            {safeOrders.slice(0, 5).map(o => (
              <div key={o._id} className="p-3 bg-white rounded-xl border border-surface-200/80 shadow-sm flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-surface-900">{o.productName}</h4>
                  <p className="text-[10px] text-surface-500">
                    {o.buyerId?.name || 'Buyer'} • <span className="font-extrabold text-brand-800">₹{o.totalPrice?.toLocaleString()}</span>
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
            {safeOrders.length === 0 && (
              <p className="text-center py-6 text-xs text-surface-400">{t('farmer.noOrdersYet', 'No orders received yet.')}</p>
            )}
          </div>

          {/* Desktop & Tablet Table (>= sm) */}
          <div className="hidden sm:block overflow-x-auto scrollbar-saas max-h-[520px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-50 text-surface-500 uppercase text-[11px] font-bold tracking-wider border-b border-surface-200 sticky top-0 bg-surface-50/95 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-6 py-3.5">{t('farmer.cropTitle', 'Product')}</th>
                  <th className="px-6 py-3.5">{t('farmer.buyerName', 'Buyer')}</th>
                  <th className="px-6 py-3.5">{t('common.amount', 'Amount')}</th>
                  <th className="px-6 py-3.5">{t('common.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {safeOrders.map((o, idx) => (
                  <tr key={o._id} className={`hover:bg-emerald-50/30 transition-colors animate-fade-in-up stagger-${(idx % 8) + 1}`}>
                    <td className="px-6 py-4 font-bold text-surface-900 font-display">
                      <div className="flex items-center gap-2">
                        <span>{o.productName}</span>
                        {o.quantity && (
                          <span className="text-[10px] text-surface-500 font-semibold bg-surface-100 px-1.5 py-0.5 rounded">
                            {o.quantity} {t('common.units', 'kg')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600">
                      <div className="font-semibold text-surface-800">{o.buyerId?.name || 'Registered Buyer'}</div>
                      {o.buyerId?.location && (
                        <div className="text-[10px] text-surface-400 font-normal">{o.buyerId.location}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-surface-900 font-display">₹{o.totalPrice?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {safeOrders.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-surface-400 text-xs font-medium">{t('farmer.noOrdersYet', 'No orders received yet.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <WeatherCard />
          <div className="card-luxe p-3.5 sm:p-5 bg-gradient-to-b from-white to-surface-50">
            <h3 className="font-bold text-surface-900 text-[11px] sm:text-xs uppercase tracking-wider mb-3 sm:mb-4 font-display">{t('farmer.quickActions', 'Fast Agricultural Actions')}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
              <Link to="/farmer/my-products" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 text-[11px] sm:text-xs font-bold transition-all border border-brand-200 hover-glow group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform shrink-0">
                  <FaBox className="text-xs sm:text-sm" />
                </div>
                <span className="truncate">{t('farmer.manageListings', 'My Listings')}</span>
              </Link>
              <Link to="/disease" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] sm:text-xs font-bold transition-all border border-emerald-200 hover-glow group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                  <FaMicroscope className="text-xs sm:text-sm" />
                </div>
                <span className="truncate">{t('nav.aiCropDoctor', 'Scan Leaf AI')}</span>
              </Link>
              <Link to="/experts" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] sm:text-xs font-bold transition-all border border-blue-200 hover-glow group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                  <FaUserMd className="text-xs sm:text-sm" />
                </div>
                <span className="truncate">{t('farmer.consultAgronomist', 'Agronomist')}</span>
              </Link>
              <Link to="/mandi" className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-harvest-50 hover:bg-harvest-100 text-harvest-900 text-[11px] sm:text-xs font-bold transition-all border border-harvest-200 hover-glow group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-harvest-100 flex items-center justify-center text-harvest-600 group-hover:scale-110 transition-transform shrink-0">
                  <FaChartLine className="text-xs sm:text-sm" />
                </div>
                <span className="truncate">{t('nav.mandiPrices', 'Mandi Rates')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
