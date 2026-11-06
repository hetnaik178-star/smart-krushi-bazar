import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAdminUsers, getAdminProducts, getAdminOrders, deleteAdminUser, deleteAdminProduct, API_URL } from '../../services/api';
import SmartImage from '../../components/SmartImage';
import EmptyState from '../../components/EmptyState';
import AdminPayments from './AdminPayments';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaShieldAlt, FaUsers, FaBox, FaShoppingBag, FaSyncAlt, FaTrashAlt, 
  FaFileCsv, FaDownload, FaTruck, FaClock, FaCheckCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, gradient, delayClass }) => (
  <div className={`card-luxe p-2 sm:p-5 relative overflow-hidden group animate-slide-up ${delayClass} min-w-0 w-full`}>
    <div className={`w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center text-white mb-1 sm:mb-3 shadow-md ${gradient} shrink-0`}>
      <Icon className="text-[11px] sm:text-lg" />
    </div>
    <p className="text-base sm:text-2xl font-black text-surface-900 font-display animate-count truncate">{value}</p>
    <p className="text-[9px] sm:text-xs text-surface-500 font-bold uppercase tracking-wider mt-0.5 truncate">{label}</p>
  </div>
);



const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingSales, setExportingSales] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

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

  // 1-Click Viva Demo Reset Handler
  const handleSeedDemoData = async () => {
    if (!window.confirm('Are you sure you want to reset & populate fresh verified demo data (Het Naik - Farmer, Meet Naik - Buyer, Dr. Jeet - Expert, products, and traceable orders) for your viva demo?')) {
      return;
    }

    setSeedingDemo(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/admin/seed-demo`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        toast.success('⚡ Platform reset with verified viva demo data!', { duration: 5000, icon: '🌱' });
        await loadAdminData();
      } else {
        toast.error('Could not complete demo seeding');
      }
    } catch (err) {
      console.error('Seed demo error:', err);
      toast.error(err.response?.data?.message || 'Failed to seed demo data');
    } finally {
      setSeedingDemo(false);
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

  // CSV Export for Users
  const handleExportUsers = async () => {
    setExportingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/export/users`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart_krushi_users_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully as CSV!', { icon: '📥' });
    } catch (err) {
      console.error('Export users error:', err);
      toast.error('Failed to export users CSV');
    } finally {
      setExportingUsers(false);
    }
  };

  // CSV Export for Sales/Orders Report
  const handleExportSales = async () => {
    setExportingSales(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/export/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart_krushi_sales_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Sales report exported successfully as CSV!', { icon: '📊' });
    } catch (err) {
      console.error('Export sales error:', err);
      toast.error('Failed to export sales report CSV');
    } finally {
      setExportingSales(false);
    }
  };

  // Update order tracking status from admin console
  const handleUpdateTracking = async (orderId, newTrackingStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/orders/${orderId}/tracking`, {
        trackingStatus: newTrackingStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(orders.map(o => o._id === orderId ? { ...o, trackingStatus: newTrackingStatus } : o));
      toast.success(`Tracking updated to: ${newTrackingStatus}`);
    } catch (err) {
      toast.error('Failed to update tracking status');
    }
  };

  return (
    <div className="page-fade-in w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
      {/* Header with Export Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold mb-2">
            <FaShieldAlt className="text-purple-600 shrink-0" /> Platform Governance
          </div>
          <h1 className="page-heading">{t('admin.title', 'Admin Control Console')}</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">
            {t('admin.subtitle', 'Platform management, user verification, catalog moderation, and payment logs.')}
          </p>
        </div>

        {/* Top Action Buttons: CSV Exports & Refresh */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleExportUsers}
            disabled={exportingUsers}
            className="btn-luxe-primary text-xs !py-2 !px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-800 to-indigo-700 shadow-md w-full sm:w-auto min-w-0"
            title="Export all registered users as CSV"
          >
            <FaFileCsv className="text-xs shrink-0" />
            <span className="truncate">{exportingUsers ? 'Exporting...' : 'Users CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportSales}
            disabled={exportingSales}
            className="btn-luxe-primary text-xs !py-2 !px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-800 to-teal-700 shadow-md w-full sm:w-auto min-w-0"
            title="Export platform transactions and orders report as CSV"
          >
            <FaDownload className="text-xs shrink-0" />
            <span className="truncate">{exportingSales ? 'Exporting...' : 'Sales CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={seedingDemo}
            className="btn-luxe-primary text-xs !py-2 !px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md transition-all active:scale-95 w-full sm:w-auto min-w-0"
            title="Reset verified demo accounts, products, and orders for viva"
          >
            <FaSyncAlt className={`text-xs shrink-0 ${seedingDemo ? 'animate-spin' : ''}`} />
            <span className="truncate">{seedingDemo ? 'Restoring...' : '⚡ Viva Reset'}</span>
          </button>

          <button
            onClick={loadAdminData}
            className="btn-luxe-primary text-xs !py-2 !px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md w-full sm:w-auto min-w-0"
          >
            <FaSyncAlt className={`text-xs shrink-0 ${loading ? 'animate-spin' : ''}`} />
            <span className="truncate">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-6 sm:mb-8 w-full min-w-0">
        <StatCard delayClass="stagger-1" icon={FaUsers} label="Users" value={users.length} gradient="bg-gradient-to-tr from-purple-700 to-indigo-600" />
        <StatCard delayClass="stagger-2" icon={FaBox} label="Crops" value={products.length} gradient="bg-gradient-to-tr from-brand-700 to-emerald-500" />
        <StatCard delayClass="stagger-3" icon={FaShoppingBag} label="Orders" value={orders.length} gradient="bg-gradient-to-tr from-blue-700 to-teal-500" />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-surface-100/80 rounded-2xl border border-surface-200/80 mb-6 backdrop-blur-sm overflow-x-auto scrollbar-none no-scrollbar w-full min-w-0">
        {[
          { id: 'users', label: `${t('admin.usersTab', 'Users')} (${users.length})`, icon: '👤' },
          { id: 'products', label: `${t('admin.productsTab', 'Products')} (${products.length})`, icon: '🥬' },
          { id: 'orders', label: `${t('admin.ordersTab', 'Orders')} (${orders.length})`, icon: '📦' },
          { id: 'payments', label: t('admin.paymentsTab', 'Payment Logs'), icon: '💳' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 relative ${
              activeTab === tab.id
                ? 'bg-white text-brand-900 shadow-sm animate-scale-in z-10'
                : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-brand-400 to-emerald-400 rounded-t-full"></div>
            )}
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
            <div className="card-luxe overflow-hidden shadow-2xl">
              {/* Mobile Card View (< md) */}
              <div className="block md:hidden divide-y divide-surface-100 p-2 space-y-2 w-full">
                {users.map((u, idx) => (
                  <div key={u._id} className="p-3 bg-white/95 rounded-2xl border border-surface-200/80 shadow-sm space-y-2 animate-slide-up w-full min-w-0">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'Farmer' ? 'bg-emerald-100 text-emerald-700' :
                          u.role === 'Expert' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-xs text-surface-900 truncate font-display">{u.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                              u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              u.role === 'Farmer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              u.role === 'Expert' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {u.role}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[9px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Active
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors border border-red-100 shrink-0"
                        title="Delete User"
                        aria-label="Delete User"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>

                    <div className="bg-surface-50/80 p-2 rounded-xl border border-surface-100 space-y-1 text-[11px] w-full">
                      <div className="flex items-center gap-1.5 text-surface-600 truncate">
                        <span className="text-surface-400 font-bold text-[10px] shrink-0">Email:</span>
                        <span className="font-semibold truncate text-surface-800 select-all">{u.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-surface-600 truncate">
                        <span className="text-surface-400 font-bold text-[10px] shrink-0">Location:</span>
                        <span className="font-medium truncate text-surface-700">{u.location || 'Gujarat, India'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop / Tablet Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">{t('common.name', 'Name')}</th>
                      <th className="px-6 py-4">{t('auth.emailLabel', 'Email')}</th>
                      <th className="px-6 py-4">{t('auth.roleLabel', 'Role')}</th>
                      <th className="px-6 py-4">{t('auth.locationLabel', 'Location')}</th>
                      <th className="px-6 py-4">{t('common.status', 'Status')}</th>
                      <th className="px-6 py-4 text-right">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {users.map((u, idx) => (
                      <tr key={u._id} className={`hover:bg-purple-50/20 transition-colors animate-slide-up stagger-${(idx % 8) + 1}`}>
                        <td className="px-6 py-4 font-bold text-surface-900 font-display flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </span>
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-surface-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'Farmer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            u.role === 'Expert' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-surface-500">{u.location || 'Not set'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        </td>
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
            <div className="card-luxe overflow-hidden shadow-2xl">
              {/* Mobile Card View (< md) */}
              <div className="block md:hidden divide-y divide-surface-100 p-2.5 space-y-2.5">
                {products.map((p, idx) => (
                  <div key={p._id} className="p-3 bg-white/90 rounded-2xl border border-surface-200/80 shadow-sm flex items-center justify-between gap-3 animate-slide-up">
                    <div className="flex items-center gap-3 min-w-0">
                      <SmartImage
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-surface-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-surface-900 truncate font-display">{p.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="bg-emerald-50 text-brand-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-surface-500 truncate">{p.farmerId?.name || 'Verified Farmer'}</span>
                        </div>
                        <p className="text-xs font-black text-brand-800 font-display mt-1">
                          ₹{p.price} <span className="text-[10px] font-normal text-surface-500">/ {p.unit || 'kg'} • {p.quantity} left</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p._id, p.name)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors border border-red-100 shrink-0"
                      title="Delete Product"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop / Tablet Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Farmer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {products.map((p, idx) => (
                      <tr key={p._id} className={`hover:bg-emerald-50/20 transition-colors animate-slide-up stagger-${(idx % 8) + 1}`}>
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

          {/* ORDERS TAB WITH TRACKING STEPPER UPDATER */}
          {activeTab === 'orders' && (
            <div className="card-luxe overflow-hidden shadow-2xl">
              {/* Mobile Card View (< md) */}
              <div className="block md:hidden divide-y divide-surface-100 p-2.5 space-y-2.5">
                {orders.map((o, idx) => (
                  <div key={o._id} className="p-3 bg-white/90 rounded-2xl border border-surface-200/80 shadow-sm space-y-2.5 animate-slide-up">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-surface-900 font-display">{o.productName}</h4>
                        <p className="text-[10px] text-surface-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</span>
                        <span className="block text-[10px] text-surface-500">{o.quantity} units</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-surface-50/70 p-2 rounded-xl border border-surface-100">
                      <div>
                        <span className="text-surface-400 font-bold block">Buyer:</span>
                        <span className="font-bold text-surface-800 truncate block">{o.buyerId?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-surface-400 font-bold block">Farmer:</span>
                        <span className="font-bold text-surface-800 truncate block">{o.farmerId?.name || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        o.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.paymentMethod || 'COD'} ({o.paymentStatus || 'Pending'})
                      </span>

                      <select
                        value={o.trackingStatus || 'ORDER_PLACED'}
                        onChange={(e) => handleUpdateTracking(o._id, e.target.value)}
                        className="input-saas !py-1 !px-2 text-[10px] font-bold text-brand-900 bg-emerald-50/80 border-emerald-300 rounded-xl cursor-pointer max-w-[140px]"
                      >
                        <option value="ORDER_PLACED">1. Placed</option>
                        <option value="HARVEST_PACKED">2. Packed</option>
                        <option value="DISPATCHED">3. Dispatched</option>
                        <option value="DELIVERED">4. Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop / Tablet Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto scrollbar-saas">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Buyer</th>
                      <th className="px-6 py-4">Farmer</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total Price</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Tracking Stage</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {orders.map((o, idx) => (
                      <tr key={o._id} className={`hover:bg-emerald-50/30 transition-colors animate-slide-up stagger-${(idx % 8) + 1}`}>
                        <td className="px-6 py-4 font-bold text-surface-900 font-display">{o.productName}</td>
                        <td className="px-6 py-4 text-surface-600">
                          {o.buyerId?.name || 'N/A'}<br />
                          <span className="text-[10px] text-surface-400">{o.buyerId?.email}</span>
                        </td>
                        <td className="px-6 py-4 text-surface-600">
                          {o.farmerId?.name || 'N/A'}<br />
                          <span className="text-[10px] text-surface-400">{o.farmerId?.email}</span>
                        </td>
                        <td className="px-6 py-4 text-surface-700 font-bold">{o.quantity} units</td>
                        <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            o.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {o.paymentMethod || 'COD'} ({o.paymentStatus || 'Pending'})
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {/* Interactive Tracking Status Selector */}
                          <select
                            value={o.trackingStatus || 'ORDER_PLACED'}
                            onChange={(e) => handleUpdateTracking(o._id, e.target.value)}
                            className="input-saas !py-1 text-[11px] font-bold text-brand-900 bg-emerald-50/80 border-emerald-300 rounded-xl cursor-pointer"
                          >
                            <option value="ORDER_PLACED">1. Order Placed</option>
                            <option value="HARVEST_PACKED">2. Harvest Packed</option>
                            <option value="DISPATCHED">3. Dispatched</option>
                            <option value="DELIVERED">4. Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-surface-500 font-medium">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
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
