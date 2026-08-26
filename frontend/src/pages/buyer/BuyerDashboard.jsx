import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../services/api';
import { getWishlist } from '../../services/wishlistService';
import EmptyState from '../../components/EmptyState';
import { FaShoppingBag, FaHeart, FaTruck, FaStore, FaClock, FaCheckCircle, FaLeaf } from 'react-icons/fa';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="card-saas p-5 relative overflow-hidden group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient}`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-2xl font-black text-surface-900 font-display">{value}</p>
    <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const BuyerDashboard = () => {
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

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaShoppingBag className="text-brand-600" /> Buyer Account Portal
          </div>
          <h1 className="page-heading">Buyer Overview</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Track farm-direct shipments, order status, and saved harvests.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/products" className="btn-saas-primary text-xs flex items-center gap-2">
            <FaStore /> Browse Marketplace
          </Link>
          <Link to="/buyer/wishlist" className="btn-saas-secondary text-xs flex items-center gap-2">
            <FaHeart className="text-red-500" /> Wishlist ({wishlistCount})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FaShoppingBag} label="Total Orders" value={orders.length} gradient="bg-gradient-to-tr from-brand-700 to-emerald-500" />
        <StatCard icon={FaClock} label="Pending Dispatch" value={pending} gradient="bg-gradient-to-tr from-amber-600 to-harvest-500" />
        <StatCard icon={FaTruck} label="In Transit / Confirmed" value={accepted} gradient="bg-gradient-to-tr from-blue-700 to-indigo-500" />
        <StatCard icon={FaCheckCircle} label="Delivered Harvest" value={completed} gradient="bg-gradient-to-tr from-emerald-800 to-teal-500" />
      </div>

      {/* Recent Orders Section */}
      <div className="card-saas overflow-hidden shadow-premium">
        <div className="p-5 border-b border-surface-100 flex justify-between items-center bg-surface-50/70">
          <div>
            <h3 className="font-bold text-surface-900 font-display text-sm">Recent Farm Orders</h3>
            <p className="text-xs text-surface-500">Live order status and invoice summary</p>
          </div>
          <Link to="/buyer/orders" className="text-xs text-brand-700 font-bold hover:underline">
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FaShoppingBag}
              title="No Purchase Orders Yet"
              description="Explore verified agricultural produce directly from registered farmers with transparent pricing."
              actionText="Explore Marketplace"
              actionLink="/products"
            />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 font-bold uppercase text-[11px] tracking-wider border-b border-surface-200">
                <tr>
                  <th className="p-4">Crop Name</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {orders.slice(0, 5).map(o => (
                  <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4 font-bold text-surface-900 font-display">{o.productName}</td>
                    <td className="p-4 text-surface-700">{o.quantity} units</td>
                    <td className="p-4 font-black text-brand-800 font-display">₹{o.totalPrice}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        o.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-surface-100 text-surface-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
