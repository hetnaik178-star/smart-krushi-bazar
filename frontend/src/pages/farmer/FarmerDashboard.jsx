import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaClock, FaCheckCircle, FaPlus, FaChartLine, FaRupeeSign, FaSeedling, FaMicroscope, FaUserMd } from 'react-icons/fa';
import { getMyProducts, getFarmerOrders } from '../../services/api';
import WeatherCard from '../../components/WeatherCard';

const StatCard = ({ icon: Icon, label, value, trend, color, gradient }) => (
  <div className="card-saas p-5 relative overflow-hidden group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient || 'bg-gradient-to-tr from-brand-700 to-emerald-500'}`}>
      <Icon className="text-lg" />
    </div>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-black text-surface-900 font-display">{value}</p>
      {trend && <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{trend}</span>}
    </div>
    <p className="text-xs text-surface-500 font-semibold mt-1 uppercase tracking-wider">{label}</p>
  </div>
);

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProducts().then(setProducts).catch(() => {}),
      getFarmerOrders().then(setOrders).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const pending = orders.filter(o => o.status === 'Pending').length;
  const completed = orders.filter(o => o.status === 'Completed').length;
  const revenue = orders.filter(o => o.status === 'Completed' || o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaSeedling className="text-emerald-600" /> Farmer Control Console
          </div>
          <h1 className="page-heading">Farm Operations Hub</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Real-time inventory management, dispatches, and market logistics.</p>
        </div>
        <Link to="/farmer/add-product" className="btn-saas-primary shadow-sm">
          <FaPlus className="text-xs" /> List New Crop
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FaRupeeSign} label="Settled Revenue" value={`₹${revenue.toLocaleString()}`} gradient="bg-gradient-to-tr from-emerald-800 to-brand-600" trend="Direct Trade" />
        <StatCard icon={FaBox} label="Active Listings" value={products.length} gradient="bg-gradient-to-tr from-blue-700 to-indigo-500" />
        <StatCard icon={FaClock} label="Pending Orders" value={pending} gradient="bg-gradient-to-tr from-amber-600 to-harvest-500" />
        <StatCard icon={FaCheckCircle} label="Dispatches Done" value={completed} gradient="bg-gradient-to-tr from-brand-700 to-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-saas overflow-hidden shadow-premium">
          <div className="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50/70">
            <h2 className="font-bold text-surface-900 text-sm font-display">Recent Inbound Orders</h2>
            <Link to="/farmer/orders" className="text-xs text-brand-700 font-bold hover:underline">View all orders →</Link>
          </div>
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-50 text-surface-500 uppercase text-[11px] font-bold tracking-wider border-b border-surface-200">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Buyer</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {orders.slice(0, 5).map(o => (
                  <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-900 font-display">{o.productName}</td>
                    <td className="px-6 py-4 text-surface-600">{o.buyerId?.name || 'Registered Buyer'}</td>
                    <td className="px-6 py-4 font-black text-surface-900 font-display">₹{o.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        o.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-100 text-surface-600 border-surface-200'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-surface-400 text-xs font-medium">No orders received yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <WeatherCard />
          <div className="card-saas p-5">
            <h3 className="font-bold text-surface-900 text-xs uppercase tracking-wider mb-4 font-display">Fast Agricultural Actions</h3>
            <div className="space-y-2">
              <Link to="/farmer/my-products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/60 text-surface-800 text-xs font-bold transition-all border border-surface-200/70 hover:border-emerald-200">
                <FaBox className="text-brand-600" /> Manage Crop Catalog
              </Link>
              <Link to="/disease" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/60 text-surface-800 text-xs font-bold transition-all border border-surface-200/70 hover:border-emerald-200">
                <FaMicroscope className="text-emerald-600" /> Scan Leaf with AI Doctor
              </Link>
              <Link to="/experts" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/60 text-surface-800 text-xs font-bold transition-all border border-surface-200/70 hover:border-emerald-200">
                <FaUserMd className="text-blue-600" /> Consult Agronomist
              </Link>
              <Link to="/mandi" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/60 text-surface-800 text-xs font-bold transition-all border border-surface-200/70 hover:border-emerald-200">
                <FaChartLine className="text-harvest-600" /> Official Mandi Rates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
