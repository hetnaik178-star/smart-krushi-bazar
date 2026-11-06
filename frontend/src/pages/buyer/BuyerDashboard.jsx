import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getMyOrders } from '../../services/api';
import { getWishlist } from '../../services/wishlistService';
import EmptyState from '../../components/EmptyState';
import { FaShoppingBag, FaHeart, FaTruck, FaStore, FaClock, FaCheckCircle, FaLeaf, FaBoxes } from 'react-icons/fa';

const AnimatedCounter = ({ target }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const duration = 1500;
    const interval = 16;
    const step = target / (duration / interval);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
};

const StatCard = ({ icon: Icon, label, value, gradient, delayClass }) => (
  <div className={`card-luxe p-5 relative overflow-hidden group ${delayClass} animate-slide-up`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient}`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-2xl font-black text-surface-900 font-display">
      <AnimatedCounter target={value} />
    </p>
    <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyOrders().then(setOrders).catch(() => {}),
      getWishlist().then(w => setWishlistCount(w.length)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const pending = orders.filter(o => o.status === 'Pending').length;
  const accepted = orders.filter(o => o.status === 'Accepted').length;
  const completed = orders.filter(o => o.status === 'Completed').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? `${t('common.goodMorning', 'Good Morning')} 🌅` : hour < 18 ? `${t('common.goodAfternoon', 'Good Afternoon')} ☀️` : `${t('common.goodEvening', 'Good Evening')} 🌙`;

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Greeting Banner */}
      <div className="mb-5 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 text-white shadow-premium animate-slide-up">
        <h2 className="text-xl sm:text-2xl font-black font-display mb-1">{greeting}, {user?.name || 'Buyer'}!</h2>
        <p className="text-xs sm:text-sm font-medium opacity-90">{t('buyer.dashboardSubtitle', 'Welcome back to your Smart Krushi Bazar portal. Ready to source fresh harvests today?')}</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 sm:mb-8 gap-4">
        <div className="animate-slide-up stagger-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaShoppingBag className="text-brand-600" /> {t('buyer.dashboardTitle', 'Buyer Account Portal')}
          </div>
          <h1 className="page-heading">{t('buyer.dashboardTitle', 'Buyer Overview')}</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">{t('buyer.dashboardSubtitle', 'Track farm-direct shipments, order status, and saved harvests.')}</p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto animate-slide-up stagger-2">
          <Link to="/freight-calc" className="btn-saas-secondary text-xs flex items-center justify-center gap-1.5 hover-glow border-emerald-300 py-2">
            <FaTruck className="text-emerald-600" /> Transport
          </Link>
          <Link to="/buyer/bulk-demand" className="btn-luxe-primary text-xs flex items-center justify-center gap-1.5 shadow-md py-2">
            <FaBoxes /> Bulk Demand
          </Link>
          <Link to="/products" className="btn-saas-primary text-xs flex items-center justify-center gap-1.5 hover-glow py-2">
            <FaStore /> Marketplace
          </Link>
          <Link to="/buyer/wishlist" className="btn-saas-secondary text-xs flex items-center justify-center gap-1.5 hover-glow py-2">
            <FaHeart className="text-red-500" /> Wishlist ({wishlistCount})
          </Link>
        </div>
      </div>

      {/* B2B Wholesale Procurement Banner */}
      <div className="mb-5 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-brand-800 text-white shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg sm:text-xl text-amber-300 shrink-0">
            <FaBoxes />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mb-0.5 sm:mb-1">
              B2B Commercial Procurement
            </div>
            <h3 className="font-bold text-sm sm:text-base font-display text-white">{t('buyer.bulkDemandTitle', 'Need Commercial Wholesale Sourcing?')}</h3>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">{t('buyer.bulkDemandCardDesc', 'Post your bulk crop requirements (quintals/tonnes) directly to registered farmers with 0% middleman commissions.')}</p>
          </div>
        </div>
        <Link to="/buyer/bulk-demand" className="btn-luxe-primary !bg-white !text-brand-900 hover:!bg-emerald-50 text-xs font-extrabold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shrink-0 shadow-lg w-full md:w-auto text-center justify-center">
          {t('buyer.manageDemands', 'Manage Bulk Demands →')}
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-5 sm:mb-8">
        <StatCard icon={FaShoppingBag} label={t('orders.title', 'Total Orders')} value={orders.length} gradient="bg-gradient-to-tr from-brand-700 to-emerald-500" delayClass="stagger-1" />
        <StatCard icon={FaClock} label={t('common.pending', 'Pending Dispatch')} value={pending} gradient="bg-gradient-to-tr from-amber-600 to-harvest-500" delayClass="stagger-2" />
        <StatCard icon={FaTruck} label={t('orders.inTransit', 'In Transit / Confirmed')} value={accepted} gradient="bg-gradient-to-tr from-blue-700 to-indigo-500" delayClass="stagger-3" />
        <StatCard icon={FaCheckCircle} label={t('orders.delivered', 'Delivered Harvest')} value={completed} gradient="bg-gradient-to-tr from-emerald-800 to-teal-500" delayClass="stagger-4" />
      </div>

      {/* Recent Orders Section */}
      <div className="card-luxe overflow-hidden shadow-2xl animate-slide-up stagger-5">
        <div className="p-4 sm:p-5 border-b border-surface-100 flex justify-between items-center bg-surface-50/70">
          <div>
            <h3 className="font-bold text-surface-900 font-display text-xs sm:text-sm">{t('orders.recentOrders', 'Recent Farm Orders')}</h3>
            <p className="text-[10px] sm:text-xs text-surface-500">{t('orders.statusInvoiceSummary', 'Live order status and invoice summary')}</p>
          </div>
          <Link to="/buyer/orders" className="text-xs text-brand-700 font-bold hover:underline">
            {t('common.viewAll', 'View All Orders →')}
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 sm:p-8">
            <EmptyState
              icon={FaShoppingBag}
              title={t('orders.noOrdersTitle', 'No Purchase Orders Yet')}
              description={t('orders.noOrdersDesc', 'Explore verified agricultural produce directly from registered farmers with transparent pricing.')}
              actionText={t('buyer.browseMarket', 'Explore Marketplace')}
              actionLink="/products"
            />
          </div>
        ) : (
          <div>
            {/* Mobile Cards for Recent Orders (< sm) */}
            <div className="block sm:hidden divide-y divide-surface-100 p-3 space-y-2.5">
              {orders.slice(0, 5).map(o => (
                <div key={o._id} className="p-3 bg-white rounded-xl border border-surface-200/80 shadow-sm flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-surface-900">{o.productName}</h4>
                    <p className="text-[10px] text-surface-500">{o.quantity} units • <span className="font-extrabold text-brand-800">₹{o.totalPrice}</span></p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    o.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-surface-100 text-surface-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (>= sm) */}
            <div className="hidden sm:block overflow-x-auto scrollbar-saas">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-surface-500 font-bold uppercase text-[11px] tracking-wider border-b border-surface-200">
                  <tr>
                    <th className="p-4">{t('farmer.cropTitle', 'Crop Name')}</th>
                    <th className="p-4">{t('common.quantity', 'Quantity')}</th>
                    <th className="p-4">{t('common.total', 'Total Amount')}</th>
                    <th className="p-4">{t('common.status', 'Delivery Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 font-medium">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4 font-bold text-surface-900 font-display">{o.productName}</td>
                      <td className="p-4 text-surface-700">{o.quantity} units</td>
                      <td className="p-4 font-black text-brand-800 font-display">₹{o.totalPrice}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 flex items-center w-max gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          o.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-surface-100 text-surface-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            o.status === 'Pending' ? 'bg-amber-500' :
                            o.status === 'Completed' ? 'bg-emerald-500' :
                            o.status === 'Accepted' ? 'bg-blue-500' : 'bg-surface-400'
                          }`}></span>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
