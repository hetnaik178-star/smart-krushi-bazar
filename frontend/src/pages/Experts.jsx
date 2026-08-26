import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getExperts } from '../services/expertService';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import { FaUserMd, FaSearch, FaFilter, FaStar, FaCalendarCheck, FaRupeeSign, FaCheckCircle, FaLeaf } from 'react-icons/fa';

const Experts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Access control: If logged-in user is an Expert, redirect to Expert Dashboard
  useEffect(() => {
    if (user?.role === 'Expert') {
      navigate('/expert/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const specializations = [
    'All Specializations',
    'Organic Farming',
    'Soil & Nutrient Management',
    'Pest & Disease Control',
    'Horticulture & Fruits',
    'Agronomy & Crop Yield',
    'Irrigation & Water Tech'
  ];

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (specialization && specialization !== 'All Specializations') params.specialization = specialization;
      
      const res = await getExperts(params);
      setExperts(res.data || []);
    } catch (err) {
      console.error('Failed to load experts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'Expert') {
      fetchExperts();
    }
  }, [specialization, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperts();
  };

  if (user?.role === 'Expert') {
    return null;
  }

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 rounded-3xl p-8 text-white shadow-premium mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold text-harvest-300 border border-white/20 mb-3">
            <FaUserMd /> Certified Agricultural Scientists & Agronomists
          </div>
          <h1 className="page-heading text-white mb-3">Agronomy Advisory Network</h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-medium">
            Book 1-on-1 consultations with verified crop scientists for plant disease diagnosis, soil nutrient mapping, and organic yield maximization.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-5 mb-8 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-xs" />
          <input
            type="text"
            placeholder="Search agronomists by name, qualification, or field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-saas !pl-10 text-xs"
          />
        </form>

        <div className="w-full md:w-auto flex items-center gap-2">
          <FaFilter className="text-surface-400 text-xs" />
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="input-saas text-xs font-bold text-brand-900 bg-emerald-50/60 border-emerald-200"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card-saas p-6 h-64 skeleton-shimmer"></div>
          ))}
        </div>
      ) : experts.length === 0 ? (
        <div className="card-saas text-center py-16 p-8">
          <FaUserMd className="text-4xl text-emerald-300 mx-auto mb-3" />
          <h3 className="card-heading mb-1 font-display">No Agricultural Experts Found</h3>
          <p className="text-xs text-surface-500 font-medium">Try adjusting your search keywords or specialization filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <div key={expert._id} className="card-saas p-6 flex flex-col justify-between hover:border-emerald-300 group">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <Avatar src={expert.profileImage} name={expert.name} size="xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-surface-900 truncate font-display">{expert.name}</h3>
                      <FaCheckCircle className="text-emerald-600 text-xs shrink-0" title="Verified Specialist" />
                    </div>
                    <p className="text-xs text-brand-700 font-bold truncate">{expert.qualification || 'Agricultural Scientist'}</p>
                    <p className="text-xs text-surface-500 font-medium mt-0.5">{expert.location || 'Gujarat'}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 mb-4">
                  <p className="text-[10px] text-surface-500 font-extrabold uppercase tracking-wider">Specialization</p>
                  <p className="text-xs font-bold text-brand-900 mt-0.5">{expert.specialization || 'General Agronomy'}</p>
                </div>

                {expert.bio && (
                  <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed mb-4 font-medium">
                    {expert.bio}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-surface-100 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-surface-400 font-bold uppercase block">Consultation Fee</span>
                  <span className="text-lg font-black text-brand-900 font-display">
                    {expert.consultationFee === 0 ? 'Free' : `₹${expert.consultationFee}`}
                  </span>
                </div>

                <Link
                  to={`/experts/${expert._id}`}
                  className="btn-saas-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5 shadow-sm"
                >
                  <FaCalendarCheck /> Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experts;
