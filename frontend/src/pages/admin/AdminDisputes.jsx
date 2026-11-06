import { useState, useEffect } from 'react';
import { getAllDisputes, resolveDispute } from '../../services/disputeService';
import BackButton from '../../components/BackButton';
import { FaBalanceScale, FaCheck, FaTimes, FaSearch, FaCommentDots, FaShieldAlt, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [status, setStatus] = useState('Resolved');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await getAllDisputes();
      setDisputes(res.data || []);
    } catch (err) {
      toast.error('Failed to load platform disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    try {
      setSubmitting(true);
      await resolveDispute(selectedDispute._id, { status, adminNotes });
      toast.success(
        <div className="flex items-center gap-2">
          <FaBalanceScale className="text-emerald-500 text-lg animate-bounce-gentle" />
          <span>Dispute resolution verdict updated! ⚖️</span>
        </div>,
        { duration: 4000 }
      );
      setSelectedDispute(null);
      setAdminNotes('');
      fetchDisputes();
    } catch (err) {
      toast.error('Failed to update resolution');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Resolved':
        return { classes: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <FaCheck className="text-[10px]" /> };
      case 'Rejected':
        return { classes: 'bg-red-50 text-red-800 border-red-200', icon: <FaTimes className="text-[10px]" /> };
      case 'Under Review':
        return { classes: 'bg-blue-50 text-blue-800 border-blue-200', icon: <FaSearch className="text-[10px]" /> };
      default:
        return { classes: 'bg-amber-50 text-amber-800 border-amber-200', icon: <FaExclamationCircle className="text-[10px] animate-pulse-slow" /> };
    }
  };

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/admin/dashboard" label="Back to Admin Dashboard" />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
          <FaShieldAlt className="text-brand-600" /> Platform Governance
        </div>
        <h1 className="page-heading flex items-center gap-3">
          Dispute Moderation Center
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Review buyer complaints, inspect evidence, and enforce marketplace trade policies.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-28 skeleton-shimmer"></div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-saas text-center py-16 p-8 shadow-premium animate-fade-in">
          <FaBalanceScale className="text-5xl text-emerald-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-surface-900 font-display mb-1">No Active Platform Disputes</h2>
          <p className="text-xs text-surface-500 font-medium">All customer trade orders are currently settled with zero pending disputes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dispute Items List */}
          <div className="lg:col-span-2 space-y-4">
            {disputes.map((d, idx) => {
              const isSelected = selectedDispute?._id === d._id;
              const badge = getStatusBadge(d.status);
              return (
                <div
                  key={d._id}
                  onClick={() => {
                    setSelectedDispute(d);
                    setStatus(d.status === 'Open' ? 'Resolved' : d.status);
                    setAdminNotes(d.adminNotes || '');
                  }}
                  className={`card-saas p-6 cursor-pointer transition-all animate-slide-up stagger-${(idx % 8) + 1} ${
                    isSelected ? 'border-brand-600 ring-2 ring-emerald-200 shadow-md animate-scale-in' : 'hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-surface-900 font-display">
                        Order #{d.orderId?._id ? d.orderId._id.slice(-6).toUpperCase() : 'N/A'}
                      </span>
                      <span className="text-xs text-surface-400 font-medium">
                        • {new Date(d.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider flex items-center gap-1 ${badge.classes}`}>
                      {badge.icon} {d.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-surface-500 font-medium">Raised by: <strong className="text-surface-900">{d.buyerId?.name || 'Buyer'}</strong></span>
                      <span className="text-brand-800 font-bold">Reason: {d.reason}</span>
                    </div>
                    <p className="text-xs text-surface-700 bg-surface-50 p-3.5 rounded-xl border border-surface-200 font-medium leading-relaxed">
                      {d.description}
                    </p>
                  </div>

                  {d.adminNotes && (
                    <div className="mt-3 pt-3 border-t border-surface-100 text-xs">
                      <span className="text-[10px] font-extrabold text-brand-800 uppercase tracking-wide">Existing Verdict: </span>
                      <span className="text-surface-800 font-medium">{d.adminNotes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action / Resolution Form Panel */}
          <div className="card-saas p-6 self-start shadow-premium animate-slide-left">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-wider font-display mb-4 flex items-center gap-2">
              <FaBalanceScale className="text-brand-600" /> Resolution Action Panel
            </h2>

            {selectedDispute ? (
              <form onSubmit={handleResolveSubmit} className="space-y-4 animate-scale-in">
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200 text-xs space-y-1">
                  <p className="font-bold text-surface-900">
                    Dispute #{selectedDispute._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-surface-500 font-medium">User: {selectedDispute.buyerId?.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Resolution Verdict</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-saas text-xs font-bold"
                  >
                    <option value="Resolved">Resolved (Accept Complaint / Refund)</option>
                    <option value="Under Review">Under Review (More Info Required)</option>
                    <option value="Rejected">Rejected (Dismiss Claim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Admin Moderation Remarks</label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter formal verdict explanation for both buyer and farmer..."
                    required
                    className="input-saas resize-none text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-saas-primary text-xs !py-3 shadow-sm font-bold disabled:opacity-50 hover-glow"
                >
                  {submitting ? 'Applying Verdict...' : 'Submit Resolution Verdict'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-surface-400 italic text-center py-8 font-medium">
                Select a dispute card from the left to review claims and issue a resolution verdict.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
