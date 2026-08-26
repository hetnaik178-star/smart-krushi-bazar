import { useEffect, useState } from 'react';
import { getAdminUsers, getAdminProducts, getAdminOrders, deleteAdminUser, deleteAdminProduct } from '../../services/api';
import SmartImage from '../../components/SmartImage';
import EmptyState from '../../components/EmptyState';
import AdminPayments from './AdminPayments';
import { FaShieldAlt, FaUsers, FaBox, FaShoppingBag, FaSyncAlt, FaTrashAlt, FaRupeeSign, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="card-saas p-5 relative overflow-hidden group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient}`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-2xl font-black text-surface-900 font-display">{value}</p>
    <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [uData, pData, oData] = await Promise.all([
        getAdminUsers(),
        getAdminProducts(),
        getAdminOrders()
      ]);
      setUsers(Array.isArray(uData) ? uData : []);
      setProducts(Array.isArray(pData) ? pData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await deleteAdminUser(id);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteAdminProduct(id);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold mb-2">
            <FaShieldAlt className="text-purple-600" /> Platform Governance
          </div>
          <h1 className="page-heading">Admin Control Console</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Platform management, user verification, catalog moderation, and payment logs.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="btn-saas-secondary text-xs flex items-center gap-2"
        >
          <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={FaUsers} label="Registered Platform Users" value={users.length} gradient="bg-gradient-to-tr from-purple-700 to-indigo-600" />
        <StatCard icon={FaBox} label="Active Marketplace Crops" value={products.length} gradient="bg-gradient-to-tr from-brand-700 to-emerald-500" />
        <StatCard icon={FaShoppingBag} label="Total Direct Orders" value={orders.length} gradient="bg-gradient-to-tr from-blue-700 to-teal-500" />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface-100/80 rounded-2xl border border-surface-200/80 mb-6 backdrop-blur-sm">
        {[
          { id: 'users', label: `Users (${users.length})`, icon: '👤' },
          { id: 'products', label: `Products (${products.length})`, icon: '🥬' },
          { id: 'orders', label: `Orders (${orders.length})`, icon: '📦' },
          { id: 'payments', label: 'Payment Logs', icon: '💳' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-brand-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading && activeTab !== 'payments' ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="card-saas h-20 skeleton-shimmer"></div>
          ))}
        </div>
      ) : (
        <div>
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="card-saas overflow-hidden shadow-premium">
              <div className="overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-surface-900 font-display">{u.name}</td>
                        <td className="px-6 py-4 text-surface-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'Farmer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            u.role === 'Expert' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-surface-600">{u.phone}</td>
                        <td className="px-6 py-4 text-surface-500">{u.location}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="card-saas overflow-hidden shadow-premium">
              <div className="overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Available Stock</th>
                      <th className="px-6 py-4">Farmer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SmartImage
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-xl border border-surface-200 shadow-sm"
                            />
                            <div>
                              <p className="font-bold text-surface-900 font-display">{p.name}</p>
                              <p className="text-[10px] text-surface-400">{p.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{p.price}</td>
                        <td className="px-6 py-4 text-surface-600 font-semibold">{p.quantity} {p.unit || 'units'}</td>
                        <td className="px-6 py-4 text-surface-600">{p.farmerId?.name || 'Verified Farmer'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                            title="Delete Product"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="card-saas overflow-hidden shadow-premium">
              <div className="overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Buyer</th>
                      <th className="px-6 py-4">Farmer</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total Price</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {orders.map(o => (
                      <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-surface-900 font-display">{o.productName}</td>
                        <td className="px-6 py-4 text-surface-600">
                          {o.buyerId?.name || 'N/A'}<br />
                          <span className="text-[10px] text-surface-400">{o.buyerId?.email}</span>
                        </td>
                        <td className="px-6 py-4 text-surface-600">
                          {o.farmerId?.name || 'N/A'}<br />
                          <span className="text-[10px] text-surface-400">{o.farmerId?.email}</span>
                        </td>
                        <td className="px-6 py-4 text-surface-700">{o.quantity} units</td>
                        <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            o.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {o.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            o.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-surface-500">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <AdminPayments />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
