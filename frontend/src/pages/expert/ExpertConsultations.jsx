import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import SmartImage from '../../components/SmartImage';
import Avatar from '../../components/Avatar';
import { FaCalendarAlt, FaClock, FaComments, FaCheck, FaTimes, FaImage, FaUserMd } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ExpertConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/consultations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultations(data.data || data || []);
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
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/consultations/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Consultation marked as ${status}!`);
      fetchConsultations();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update consultation status');
    }
  };

  const filteredConsultations = consultations.filter(c => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/expert/dashboard" label="Back to Expert Dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <FaUserMd className="text-brand-600" /> Agronomy Tele-advisory
          </div>
          <h1 className="page-heading flex items-center gap-2">
            Farmer Advisory Queue
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Review farmer appointment requests, examine crop diagnosis photos, and issue advisories.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-surface-100 p-1.5 rounded-2xl border border-surface-200 text-xs font-bold">
          {['All', 'Pending', 'Confirmed', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === f ? 'bg-white text-brand-900 shadow-sm font-extrabold animate-scale-in' : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => <div key={n} className="card-saas h-36 skeleton-shimmer"></div>)}
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="card-saas p-8 animate-fade-in">
          <EmptyState
            icon={FaCalendarAlt}
            title="No Consultations Found"
            description={`There are currently no consultations matching the "${filter}" filter.`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((item, idx) => (
            <div key={item._id} className={`card-saas p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-emerald-300 transition-all stagger-${(idx % 8) + 1} animate-slide-up`}>
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                <Avatar src={item.farmerId?.profileImage} name={item.farmerId?.name} size="xl" className="ring-2 ring-emerald-200 animate-glow" />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-surface-900 text-base font-display">{item.farmerId?.name || 'Registered Farmer'}</h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider transition-colors ${
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      item.status === 'Confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      item.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold text-brand-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Fee: ₹{item.fee} ({item.paymentStatus})
                    </span>
                  </div>

                  <p className="text-xs text-surface-500 font-medium">
                    📍 {item.farmerId?.location || 'Gujarat Farm'} • 📞 {item.farmerId?.phone || item.farmerId?.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-surface-700 pt-1 font-medium">
                    <span className="flex items-center gap-1 font-bold text-brand-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <FaCalendarAlt className="text-harvest-500" />
                      {new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-surface-700 bg-surface-50 px-2.5 py-1 rounded-lg border border-surface-200">
                      <FaClock className="text-brand-600" />
                      {item.timeSlot}
                    </span>
                  </div>

                  <div className="text-xs text-surface-700 bg-surface-50 p-3.5 rounded-2xl border border-surface-200 max-w-2xl mt-2 font-medium">
                    <p className="font-bold text-surface-900 mb-0.5 font-display">Reported Crop Symptoms:</p>
                    <p className="leading-relaxed">{item.problemDescription}</p>
                  </div>

                  {item.imageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs font-bold text-surface-600 flex items-center gap-1">
                        <FaImage className="text-brand-600" /> Attached Photo:
                      </span>
                      <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                        <SmartImage src={item.imageUrl} alt="Crop Issue" className="w-16 h-16 object-cover rounded-xl border border-surface-200 shadow-sm hover:scale-105 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 self-end md:self-center w-full md:w-auto min-w-[160px]">
                <Link
                  to={`/chat?receiverId=${item.farmerId?._id}`}
                  className="btn-saas-secondary text-xs flex items-center justify-center gap-1.5"
                >
                  <FaComments className="text-brand-600" /> Message Farmer
                </Link>

                {item.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'Confirmed')}
                      className="btn-saas-primary text-xs flex-1 !py-1.5 transition-transform active:scale-95"
                    >
                      <FaCheck /> Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                      className="btn-saas-secondary text-xs text-red-600 border-red-200 hover:bg-red-50 flex-1 !py-1.5 transition-transform active:scale-95"
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                )}

                {item.status === 'Confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(item._id, 'Completed')}
                    className="btn-harvest text-xs !py-1.5 font-bold transition-transform active:scale-95"
                  >
                    <FaCheck /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertConsultations;
