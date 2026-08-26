import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getMyConsultations, updateConsultationStatus } from '../../services/consultationService';
import Avatar from '../../components/Avatar';
import SmartImage from '../../components/SmartImage';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import { FaUserMd, FaCalendarAlt, FaClock, FaComments, FaCheck, FaTimes, FaImage, FaSeedling, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FarmerConsultations = () => {
  const { user } = useContext(AuthContext);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await getMyConsultations();
      setConsultations(res.data || []);
    } catch (err) {
      console.error('Fetch consultations error:', err);
      toast.error('Failed to load consultation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateConsultationStatus(id, { status });
      toast.success(`Consultation marked as ${status}`);
      fetchConsultations();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const isExpert = user?.role === 'Expert';

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback={isExpert ? '/' : '/farmer/dashboard'} label="Back to Dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaUserMd className="text-brand-600" /> Agronomy Advisory Records
          </div>
          <h1 className="page-heading">
            {isExpert ? 'Client Advisory Schedule' : 'My Expert Consultations'}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">
            {isExpert
              ? 'Manage incoming farmer requests, diagnosis uploads, and advisory slots.'
              : 'Track your scheduled diagnostic appointments with verified agronomists.'}
          </p>
        </div>

        {!isExpert && (
          <Link to="/experts" className="btn-saas-primary text-xs flex items-center gap-1.5 shadow-sm">
            <FaUserMd /> Find New Expert
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-36 skeleton-shimmer"></div>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="card-saas p-8">
          <EmptyState
            icon={FaCalendarAlt}
            title="No Consultations Scheduled"
            description={
              isExpert
                ? 'You have no pending appointment requests at this moment.'
                : 'Book a 1-on-1 session with an agronomist to diagnose crop diseases and boost harvest yield.'
            }
            actionText={!isExpert ? 'Browse Agricultural Specialists' : null}
            actionLink="/experts"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => {
            const otherParty = isExpert ? c.farmerId : c.expertId;
            return (
              <div key={c._id} className="card-saas p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-emerald-300">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar src={otherParty?.profileImage} name={otherParty?.name || 'User'} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-surface-900 font-display">{otherParty?.name || 'Specialist'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-100 text-surface-600 border-surface-200'
                      }`}>
                        {c.paymentStatus || 'Pending'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500 font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-brand-600" /> {new Date(c.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-brand-600" /> {c.timeSlot}
                      </span>
                      <span className="font-bold text-surface-900">
                        Fee: ₹{c.fee || 0}
                      </span>
                    </div>

                    <p className="text-xs text-surface-700 bg-surface-50 p-3 rounded-xl border border-surface-200 leading-relaxed font-medium">
                      {c.problemDescription}
                    </p>

                    {c.imageUrl && (
                      <div className="mt-2">
                        <SmartImage
                          src={c.imageUrl}
                          alt="Crop symptom"
                          className="w-16 h-16 rounded-xl object-cover border border-surface-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 self-end md:self-center shrink-0">
                  <Link
                    to={`/chat?receiverId=${otherParty?._id}`}
                    className="btn-saas-secondary text-xs flex items-center gap-1.5"
                  >
                    <FaComments className="text-brand-600" /> Message
                  </Link>

                  {isExpert && c.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(c._id, 'Confirmed')}
                        className="btn-saas-primary text-xs !py-2.5"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(c._id, 'Rejected')}
                        className="btn-saas-secondary text-xs !py-2.5 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {isExpert && c.status === 'Confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(c._id, 'Completed')}
                      className="btn-saas-secondary text-xs !py-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerConsultations;
