import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDisputes, createDispute } from '../../services/disputeService';
import BackButton from '../../components/BackButton';
import { FaBalanceScale, FaExclamationCircle, FaCheckCircle, FaClock, FaPlus, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await getMyDisputes();
      setDisputes(res.data || []);
    } catch (err) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case 'Resolved': return 'border-l-emerald-500';
      case 'Rejected': return 'border-l-red-500';
      case 'Under Review': return 'border-l-blue-500';
      default: return 'border-l-amber-500';
    }
  };

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/buyer/orders" label="Back to Orders" />
      </div>

      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2 shadow-sm">
            <FaShieldAlt className="text-brand-600" /> Buyer Protection Guarantee
          </div>
          <h1 className="page-heading flex items-center gap-3">
            Dispute Resolution Center
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Track status and resolutions for your orders and farm deliveries.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-32 skeleton-shimmer"></div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-saas text-center py-16 p-8 shadow-premium animate-slide-up stagger-1">
          <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-surface-900 font-display mb-1">No Active Order Disputes</h2>
          <p className="text-xs text-surface-500 mb-6 max-w-sm mx-auto font-medium">
            All your direct farm orders are in good standing. If you ever experience issues with quality or delivery, you can raise a dispute directly from your Orders page.
          </p>
          <Link to="/buyer/orders" className="btn-saas-primary text-xs !py-3 !px-6 hover-glow">
            View My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute, idx) => {
            const isResolved = dispute.status === 'Resolved' || dispute.status === 'Rejected';
            const isUnderReview = dispute.status === 'Under Review' || isResolved;
            return (
              <div key={dispute._id} className={`card-saas p-6 hover:border-emerald-300 animate-slide-up stagger-${(idx % 8) + 1} border-l-4 ${getBorderColor(dispute.status)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-surface-900 font-display">
                      Order #{dispute.orderId?._id ? dispute.orderId._id.slice(-6).toUpperCase() : 'N/A'}
                    </span>
                    <span className="text-xs text-surface-400 font-medium">
                      • {new Date(dispute.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusBadge(dispute.status)}`}>
                    {dispute.status}
                  </span>
                </div>

                {/* Dispute Timeline Visualization */}
                <div className="my-5 flex items-center max-w-md mx-auto">
                  {/* Raised */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
                    <span className="text-[10px] font-bold mt-1.5 text-surface-700">Raised</span>
                  </div>
                  {/* Connector */}
                  <div className={`flex-1 mx-2 h-0.5 ${isUnderReview ? 'bg-emerald-500' : 'bg-surface-200'}`}></div>
                  {/* Review */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ring-2 ${isUnderReview ? 'bg-emerald-500 ring-emerald-100' : 'bg-surface-200 ring-white'}`}></div>
                    <span className="text-[10px] font-bold mt-1.5 text-surface-700">Review</span>
                  </div>
                  {/* Connector */}
                  <div className={`flex-1 mx-2 h-0.5 ${isResolved ? 'bg-emerald-500' : 'bg-surface-200'}`}></div>
                  {/* Verdict */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ring-2 ${isResolved ? 'bg-emerald-500 ring-emerald-100' : 'bg-surface-200 ring-white'}`}></div>
                    <span className="text-[10px] font-bold mt-1.5 text-surface-700">Verdict</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-brand-900">
                    Reason: <span className="font-medium text-surface-800">{dispute.reason}</span>
                  </p>
                  <p className="text-xs text-surface-700 bg-surface-50 p-3.5 rounded-xl border border-surface-200 leading-relaxed font-medium">
                    {dispute.description}
                  </p>
                </div>

                {dispute.adminNotes && (
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <p className="text-[10px] font-extrabold text-brand-800 uppercase tracking-wide">
                      Admin Resolution Verdict:
                    </p>
                    <p className="text-xs text-brand-950 mt-1.5 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 font-medium leading-relaxed shadow-sm">
                      {dispute.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDisputes;
