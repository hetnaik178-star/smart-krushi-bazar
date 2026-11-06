import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaUserMd, FaClock, FaCheckCircle, FaEnvelope, FaRupeeSign, FaCalendarAlt, FaMapMarkerAlt, FaMicroscope } from 'react-icons/fa';
import SmartImage from '../../components/SmartImage';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, gradient, delayClass }) => (
  <div className={`card-luxe p-5 relative overflow-hidden group ${delayClass} animate-slide-up`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md ${gradient}`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-2xl font-black text-surface-900 font-display animate-count">{value}</p>
    <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const ExpertDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/consultations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultations(data.data || data || []);
    } catch (err) {
      console.error('Expert consultations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      let statusParam = status === 'accept' ? 'Confirmed' : status === 'reject' ? 'Rejected' : 'Completed';

      await axios.put(
        `${API_URL}/consultations/${id}/status`,
        { status: statusParam },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Consultation marked as ${statusParam}`);
      fetchConsultations();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const pending = consultations.filter(c => c.status === 'Pending').length;
  const confirmed = consultations.filter(c => c.status === 'Confirmed').length;
  const paidCount = consultations.filter(c => c.paymentStatus === 'Paid').length;
  const revenue = consultations
    .filter(c => c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + (c.fee || 0), 0);

  if (loading) {
    return <div className="p-12 text-center text-xs text-surface-500 font-bold">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaUserMd className="text-brand-600" /> {t('expert.dashboardTitle', 'Specialist Advisory Console')}
          </div>
          <h1 className="page-heading">{t('common.welcomeUser', { name: user?.name || 'Agronomist' }, `Welcome back, ${user?.name || 'Agronomist'}!`)}</h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">{t('expert.dashboardSubtitle', 'Manage farmer diagnostic requests, advisory schedules, and fee earnings.')}</p>
        </div>
        <Link to="/expert/messages" className="btn-saas-secondary text-xs flex items-center gap-2 hover-glow">
          <FaEnvelope className="text-brand-700" /> {t('expert.activeConsultations', 'Farmer Inquiries')}
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard delayClass="stagger-1" icon={FaRupeeSign} label={t('expert.consultationFee', 'Earned Consultation Fees')} value={`₹${revenue.toLocaleString()}`} gradient="bg-gradient-to-tr from-emerald-800 to-brand-600" />
        <StatCard delayClass="stagger-2" icon={FaCheckCircle} label={t('expert.completedCases', 'Paid Sessions')} value={paidCount} gradient="bg-gradient-to-tr from-blue-700 to-indigo-500" />
        <StatCard delayClass="stagger-3" icon={FaClock} label={t('common.pending', 'Pending Review')} value={pending} gradient="bg-gradient-to-tr from-amber-600 to-harvest-500" />
        <StatCard delayClass="stagger-4" icon={FaUserMd} label={t('expert.activeConsultations', 'Active Consultations')} value={confirmed} gradient="bg-gradient-to-tr from-brand-700 to-teal-500" />
      </div>

      <div className="card-luxe overflow-hidden shadow-2xl animate-slide-up stagger-5">
        <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/70">
          <h2 className="font-bold text-surface-900 text-sm font-display">{t('expert.upcomingSessions', 'Inbound Diagnostic & Consultation Requests')}</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {consultations.length === 0 ? (
            <div className="p-14 text-center text-surface-400 text-xs font-medium">{t('expert.noConsultations', 'No consultation requests at the moment.')}</div>
          ) : (
            consultations.map((c, idx) => (
              <div key={c._id} className={`p-6 hover:bg-emerald-50/20 transition-colors stagger-${(idx % 8) + 1} animate-slide-up`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-sm text-surface-900 font-display">{c.farmerId?.name || t('roles.farmer', 'Farmer Client')}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        c.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        c.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        c.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>{c.status}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-100 text-surface-600 border-surface-200'
                      }`}>
                        {c.paymentStatus || 'Pending'} ({c.paymentMethod || 'Razorpay'})
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 flex flex-wrap items-center gap-3 font-medium">
                      <span>📍 {c.farmerId?.location || 'Gujarat'}</span>
                      <span>📅 {new Date(c.date).toLocaleDateString()} at {c.timeSlot}</span>
                      <span className="font-bold text-brand-800">{t('common.price', 'Fee')}: ₹{c.fee || 0}</span>
                    </p>
                    <p className="text-xs text-surface-700 leading-relaxed bg-surface-50 p-3.5 rounded-xl border border-surface-200 max-w-2xl font-medium">
                      {c.problemDescription}
                    </p>
                    {c.imageUrl && (
                      <div className="pt-1">
                        <SmartImage src={c.imageUrl} alt="Crop" className="w-20 h-20 object-cover rounded-xl border border-surface-200 shadow-sm hover:scale-105 transition-transform" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 md:items-end justify-center min-w-[150px]">
                    {c.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(c._id, 'accept')} className="w-full btn-saas-primary text-xs !py-2.5">{t('expert.acceptSession', 'Accept Session')}</button>
                        <button onClick={() => handleStatusUpdate(c._id, 'reject')} className="w-full btn-saas-secondary text-xs !py-2.5 text-red-600 border-red-200 hover:bg-red-50">{t('expert.declineSession', 'Decline')}</button>
                      </>
                    )}
                    {c.status === 'Confirmed' && (
                      <button onClick={() => handleStatusUpdate(c._id, 'complete')} className="w-full btn-saas-secondary text-xs !py-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        {t('orders.markCompleted', 'Mark Completed')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;
