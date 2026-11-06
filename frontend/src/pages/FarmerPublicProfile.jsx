import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import ProductCard from '../components/ProductCard';
import BackButton from '../components/BackButton';
import { getPublicFarmerProfile } from '../services/profileService';
import { useLanguage } from '../context/LanguageContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaBoxOpen, FaLeaf, FaTractor, FaShieldAlt } from 'react-icons/fa';

const FarmerPublicProfile = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const data = await getPublicFarmerProfile(id);
        setFarmer(data.data);
      } catch (err) {
        setError('Farmer not found');
      } finally {
        setLoading(false);
      }
    };
    fetchFarmer();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card-saas h-96 skeleton-shimmer"></div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="card-saas p-12">
          <p className="text-surface-500 text-sm font-medium mb-4">{error || 'Farmer profile not found'}</p>
          <Link to="/products" className="btn-saas-primary text-xs">Explore Marketplace</Link>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(farmer.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/products" label={t('common.backToMarket', 'Back to Marketplace')} />
      </div>

      {/* Profile Header */}
      <div className="card-saas overflow-hidden shadow-premium">
        <div className="h-36 bg-gradient-to-r from-brand-950 via-brand-800 to-emerald-800 relative">
          <div className="absolute top-4 right-4 text-white/10 text-7xl font-black font-display pointer-events-none">
            PRODUCE
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            <Avatar src={farmer.profileImage} name={farmer.name} size="3xl" className="border-4 border-white shadow-xl ring-2 ring-emerald-200" />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-surface-900 font-display">{farmer.name}</h1>
                <RoleBadge role="Farmer" />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-surface-500">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-emerald-600" /> {farmer.location || 'Gujarat Farm'}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-brand-600" /> {t('profile.joinedOn', { date: joinedDate }, `Member since ${joinedDate}`)}
                </span>
              </div>
            </div>
          </div>

          {farmer.bio && (
            <p className="mt-5 text-xs text-surface-700 leading-relaxed max-w-3xl bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 font-medium">
              {farmer.bio}
            </p>
          )}
        </div>
      </div>

      {/* Farmer Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="card-saas p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-200">
            <FaBoxOpen />
          </div>
          <div>
            <p className="text-2xl font-black text-surface-900 font-display">{farmer.activeProducts}</p>
            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{t('farmer.activeListings', 'Active Harvests')}</p>
          </div>
        </div>

        <div className="card-saas p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-amber-200">
            <FaLeaf />
          </div>
          <div>
            <p className="text-2xl font-black text-surface-900 font-display">{farmer.products?.length || 0}</p>
            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{t('farmer.manageListings', 'Total Listings')}</p>
          </div>
        </div>

        <div className="card-saas p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-200">
            <FaCalendarAlt />
          </div>
          <div>
            <p className="text-base font-black text-surface-900 font-display">{joinedDate}</p>
            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{t('common.verified', 'Verified Since')}</p>
          </div>
        </div>
      </div>

      {/* Farm Details */}
      {(farmer.farmName || farmer.specialization) && (
        <div className="card-saas p-6 sm:p-7 mt-6 shadow-premium">
          <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4 font-display">{t('profile.title', 'About Farm Operations')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {farmer.farmName && (
              <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wide">{t('profile.farmName', 'Farm Title')}</p>
                <p className="text-xs font-bold text-surface-800 mt-0.5">{farmer.farmName}</p>
              </div>
            )}
            {farmer.specialization && (
              <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wide">{t('expert.specialization', 'Specialization')}</p>
                <p className="text-xs font-bold text-surface-800 mt-0.5">{farmer.specialization}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Crop Listings */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-surface-900 font-display mb-6">
          Fresh Harvest Listed by {farmer.name} ({farmer.activeProducts})
        </h2>
        
        {farmer.products && farmer.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {farmer.products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card-saas p-12 text-center">
            <FaBoxOpen className="text-4xl text-emerald-200 mx-auto mb-4" />
            <p className="text-xs text-surface-500 font-medium">{t('farmer.noListingsDesc', 'No active products listed yet by this farmer.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerPublicProfile;
