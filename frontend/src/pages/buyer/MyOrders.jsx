import { useEffect, useState } from 'react';
import { getMyOrders } from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import { FaBoxOpen, FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle, FaTruck, FaLeaf } from 'react-icons/fa';

const PaymentBadge = ({ order }) => {
  if (order.paymentMethod === 'COD' || (!order.razorpayPaymentId && order.paymentStatus === 'Pending')) {
    return (
      <div className="flex flex-col">
        <span className="text-xs font-bold text-surface-800">Cash on Delivery</span>
        <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
          <FaClock className="text-[9px]" /> Pay on arrival
        </span>
      </div>
    );
  }
  const isPaid = order.paymentStatus === 'Paid';
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-surface-800">Razorpay Online</span>
      <span className={`text-[10px] font-bold flex items-center gap-1 ${isPaid ? 'text-emerald-700' : 'text-red-600'}`}>
        {isPaid ? <><FaCheckCircle className="text-[9px]" /> Verified Paid</> : <><FaTimesCircle className="text-[9px]" /> Pending</>}
      </span>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <BackButton fallback="/buyer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
          <FaTruck className="text-brand-600" /> Direct Farm Orders
        </div>
        <h1 className="page-heading flex items-center gap-3">
          My Crop Purchases & Orders
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Review full transaction history, payment verification, and real-time delivery status.</p>
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
            icon={FaBoxOpen}
            title="No Orders Yet"
            description="You haven't placed any orders yet. Browse the marketplace to discover freshly harvested crops directly from local farmers."
            actionText="Explore Marketplace"
            actionLink="/products"
          />
        </div>
      ) : (
        <div className="card-saas overflow-hidden shadow-premium">
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Produce</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-900 font-display">{o.productName}</td>
                    <td className="px-6 py-4 text-surface-700 font-bold">{o.quantity} units</td>
                    <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{o.totalPrice}</td>
                    <td className="px-6 py-4">
                      <PaymentBadge order={o} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-500 font-medium">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
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

export default MyOrders;
