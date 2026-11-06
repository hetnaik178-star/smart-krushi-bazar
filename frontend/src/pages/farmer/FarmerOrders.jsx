import { useEffect, useState } from 'react';
import { getFarmerOrders, updateOrderStatus } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import { FaClipboardList, FaCheck, FaTimes, FaInbox, FaTruck, FaLeaf, FaCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FarmerOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getFarmerOrders();
      setOrders(data || []);
    } catch (err) {
      toast.error('Failed to load incoming orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}!`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FaCheck className="text-[8px]" /> Completed
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Accepted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
            <FaTimes className="text-[8px]" /> Cancelled
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Pending
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(o => filter === 'All' || o.status === filter);

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label={t('nav.dashboard', 'Back to Dashboard')} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2 shadow-sm">
            <FaTruck className="text-brand-600" /> {t('farmer.dispatchQueue', 'Dispatch Queue')}
          </div>
          <h1 className="page-heading flex items-center gap-3">
            {t('farmer.manageOrders', 'Incoming Direct Harvest Orders')}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">{t('farmer.ordersSubtitle', 'Review buyer purchasing requests, confirm dispatch readiness, and track settlements.')}</p>
        </div>

        <div className="flex bg-surface-100 p-1 rounded-xl shadow-inner animate-slide-up stagger-1 overflow-x-auto scrollbar-none">
          {['All', 'Pending', 'Accepted', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                filter === status 
                  ? 'bg-white text-brand-700 shadow-sm border border-surface-200 hover-glow' 
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-200/50'
              }`}
            >
              {status === 'All' ? t('common.all', 'All') :
               status === 'Pending' ? t('common.pending', 'Pending') :
               status === 'Accepted' ? t('orders.accepted', 'Accepted') :
               t('common.completed', 'Completed')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-20 skeleton-shimmer"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card-saas p-8 animate-scale-in">
          <EmptyState
            icon={FaInbox}
            title={filter === 'All' ? t('orders.noOrdersTitle', 'No Orders Received Yet') : `No ${filter} Orders`}
            description={filter === 'All' ? t('orders.noOrdersDesc', 'Your crops are listed on the marketplace. New orders placed by buyers will show up here immediately.') : `You have no orders currently in the ${filter} status.`}
            actionText={filter === 'All' ? t('farmer.manageListings', 'View Active Crops') : t('marketplace.clearFilters', 'Clear Filter')}
            actionLink={filter === 'All' ? "/farmer/my-products" : undefined}
            onAction={filter !== 'All' ? () => setFilter('All') : undefined}
          />
        </div>
      ) : (
        <div className="card-saas overflow-hidden shadow-premium animate-slide-up stagger-2">
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('farmer.cropTitle', 'Produce Name')}</th>
                  <th className="px-6 py-4">{t('farmer.buyerName', 'Buyer Details')}</th>
                  <th className="px-6 py-4">{t('common.quantity', 'Quantity')}</th>
                  <th className="px-6 py-4">{t('common.total', 'Total Amount')}</th>
                  <th className="px-6 py-4">{t('common.status', 'Status')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {filteredOrders.map((o, idx) => (
                  <tr key={o._id} className={`hover:bg-emerald-50/30 transition-colors animate-fade-in-up stagger-${(idx % 8) + 1}`}>
                    <td className="px-6 py-4 font-bold text-surface-900 font-display text-sm">{o.productName}</td>
                    <td className="px-6 py-4 text-surface-700">
                      <span className="font-bold block">{o.buyerId?.name || 'Registered Buyer'}</span>
                      <span className="text-[11px] text-surface-400 block font-medium mt-0.5">{o.buyerId?.phone || o.buyerId?.email}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-700">{o.quantity} units</td>
                    <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {o.status === 'Pending' && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(o._id, 'Accepted')}
                            className="btn-saas-primary text-xs !py-1.5 !px-3 shadow-sm hover:shadow-md"
                          >
                            {t('farmer.accept', 'Accept')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(o._id, 'Cancelled')}
                            className="btn-saas-secondary text-xs !py-1.5 !px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {t('farmer.reject', 'Reject')}
                          </button>
                        </div>
                      )}
                      {o.status === 'Accepted' && (
                        <button
                          onClick={() => handleStatusChange(o._id, 'Completed')}
                          className="btn-harvest text-xs !py-1.5 !px-4 font-bold shadow-sm hover:shadow-md hover:scale-105 transition-transform"
                        >
                          {t('orders.markCompleted', 'Mark Completed')}
                        </button>
                      )}
                      {o.status === 'Completed' && (
                        <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <FaCheck className="text-emerald-500" /> {t('orders.delivered', 'Fulfilled')}
                        </span>
                      )}
                      {o.status === 'Cancelled' && (
                        <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          <FaTimes className="text-red-500" /> {t('common.cancelled', 'Voided')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
