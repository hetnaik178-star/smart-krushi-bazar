import { useEffect, useState } from 'react';
import { getFarmerOrders, updateOrderStatus } from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import { FaClipboardList, FaCheck, FaTimes, FaInbox, FaTruck, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Accepted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
          <FaTruck className="text-brand-600" /> Dispatch Queue
        </div>
        <h1 className="page-heading flex items-center gap-3">
          Incoming Direct Harvest Orders
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Review buyer purchasing requests, confirm dispatch readiness, and track settlements.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-20 skeleton-shimmer"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-saas p-8">
          <EmptyState
            icon={FaInbox}
            title="No Orders Received Yet"
            description="Your crops are listed on the marketplace. New orders placed by buyers will show up here immediately."
            actionText="View Active Crops"
            actionLink="/farmer/my-products"
          />
        </div>
      ) : (
        <div className="card-saas overflow-hidden shadow-premium">
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Produce Name</th>
                  <th className="px-6 py-4">Buyer Details</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-900 font-display">{o.productName}</td>
                    <td className="px-6 py-4 text-surface-700">
                      {o.buyerId?.name || 'Registered Buyer'}
                      <span className="text-[11px] text-surface-400 block font-medium">{o.buyerId?.phone || o.buyerId?.email}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-700">{o.quantity} units</td>
                    <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {o.status === 'Pending' && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(o._id, 'Accepted')}
                            className="btn-saas-primary text-xs !py-1.5 !px-3"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleStatusChange(o._id, 'Cancelled')}
                            className="btn-saas-secondary text-xs !py-1.5 !px-3 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {o.status === 'Accepted' && (
                        <button
                          onClick={() => handleStatusChange(o._id, 'Completed')}
                          className="btn-harvest text-xs !py-1.5 !px-3 font-bold"
                        >
                          Mark Completed
                        </button>
                      )}
                      {o.status === 'Completed' && (
                        <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                          <FaCheck /> Fulfilled
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
