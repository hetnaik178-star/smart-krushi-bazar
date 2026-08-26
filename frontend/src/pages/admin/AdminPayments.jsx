import { useEffect, useState } from 'react';
import { getAllPayments } from '../../services/paymentService';
import { FaRupeeSign } from 'react-icons/fa';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ method: 'All', status: 'All' });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.method !== 'All') params.set('method', filters.method);
      if (filters.status !== 'All') params.set('status', filters.status);
      const r = await getAllPayments(params.toString());
      setPayments(r.data || []);
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  const statusBadge = (s) => ({
    Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Failed: 'bg-red-50 text-red-700 border border-red-200',
    Verification_Failed: 'bg-amber-50 text-amber-700 border border-amber-200',
    Created: 'bg-surface-100 text-surface-600 border border-surface-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200'
  }[s] || 'bg-surface-100 text-surface-600 border border-surface-200');

  return (
    <div className="card-saas overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-200 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-surface-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <FaRupeeSign className="text-sm" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-900 text-sm">Payment Transactions</h2>
            <p className="text-[11px] text-surface-500">Live order settlements and gateway records</p>
          </div>
          <span className="text-xs font-bold text-brand-900 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 ml-2">
            {payments.length}
          </span>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.method}
            onChange={e => setFilters(f => ({ ...f, method: e.target.value }))}
            className="input-saas text-xs !py-1.5 w-32"
          >
            <option value="All">All Methods</option>
            <option value="Razorpay">Razorpay</option>
            <option value="COD">COD</option>
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="input-saas text-xs !py-1.5 w-32"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-saas">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50 text-surface-500 uppercase text-[11px] font-bold tracking-wider border-b border-surface-200">
            <tr>
              <th className="px-6 py-3.5">Buyer / User</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Method</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Payment Status</th>
              <th className="px-6 py-3.5">Razorpay ID</th>
              <th className="px-6 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {payments.map(p => (
              <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                <td className="px-6 py-4 font-bold text-surface-900">
                  {p.userId?.name || 'User'}
                  <span className="block text-[10px] text-surface-400 font-normal">{p.userId?.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize font-semibold text-surface-700 bg-surface-100 px-2 py-0.5 rounded text-[10px]">
                    {p.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.paymentMethod === 'COD' ? 'bg-surface-100 text-surface-700 border-surface-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
                    {p.paymentMethod || 'Razorpay'}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-brand-900 text-sm">₹{p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-[11px] text-surface-500 truncate max-w-[140px]">
                  {p.razorpayPaymentId || '—'}
                </td>
                <td className="px-6 py-4 text-surface-500 font-medium">
                  {new Date(p.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan="7" className="p-10 text-center text-surface-400 text-xs">
                  No payments found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
