import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import BackButton from '../components/BackButton';
import { getMyProfile, getProfileStats } from '../services/profileService';
import { FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaEnvelope, FaPhone, FaLeaf, FaTractor, FaShieldAlt } from 'react-icons/fa';

const MyProfile = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          getMyProfile(),
          getProfileStats()
        ]);
        setProfile(profileData.data);
        setStats(statsData.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card-saas h-96 skeleton-shimmer"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center card-saas">
        <p className="text-surface-500 text-sm font-medium">Profile not found.</p>
        <Link to="/" className="btn-saas-primary mt-4 inline-block text-xs">Return to Home</Link>
      </div>
    );
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getDashboardFallback = () => {
    if (profile.role === 'Farmer') return '/farmer/dashboard';
    if (profile.role === 'Admin') return '/admin/dashboard';
    if (profile.role === 'Expert') return '/expert/dashboard';
    return '/buyer/dashboard';
  };

  return (
    <div className="page-fade-in max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback={getDashboardFallback()} label={t('nav.dashboard', 'Back to Dashboard')} />
      </div>

      {/* Profile Header Card */}
      <div className="card-saas overflow-hidden shadow-premium">
        {/* Banner Background */}
        <div className="h-36 bg-gradient-to-r from-brand-950 via-brand-800 to-emerald-800 relative">
          <div className="absolute top-4 right-4 text-white/10 text-7xl font-black font-display pointer-events-none">
            KRUSHI
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-8 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            <Avatar src={profile.profileImage} name={profile.name} size="3xl" className="border-4 border-white shadow-xl ring-2 ring-emerald-200" />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-surface-900 font-display">{profile.name}</h1>
                <RoleBadge role={profile.role} />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-surface-500">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-emerald-600" /> {profile.location || 'Gujarat'}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-brand-600" /> {t('common.date', 'Joined')} {joinedDate}
                </span>
              </div>
            </div>
            <Link to="/profile/edit" className="btn-saas-secondary text-xs !py-2.5 self-start md:self-auto shadow-sm">
              <FaEdit className="mr-1.5 text-brand-700" /> {t('nav.editProfile', 'Edit Profile')}
            </Link>
          </div>

          {profile.bio && (
            <p className="mt-5 text-xs text-surface-700 leading-relaxed max-w-3xl bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 font-medium">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {profile.role === 'Farmer' ? (
            <>
              <StatCard label={t('farmer.activeListings', 'Active Crops')} value={stats.activeProducts} color="green" />
              <StatCard label={t('orders.title', 'Total Orders')} value={stats.totalOrders} color="blue" />
              <StatCard label={t('farmer.pendingDispatches', 'Pending Orders')} value={stats.pendingOrders} color="amber" />
              <StatCard label={t('orders.delivered', 'Dispatches')} value={stats.completedOrders} color="emerald" />
            </>
          ) : (
            <>
              <StatCard label={t('orders.title', 'Total Orders')} value={stats.totalOrders} color="blue" />
              <StatCard label={t('orders.inTransit', 'In Transit')} value={stats.pendingOrders} color="amber" />
              <StatCard label={t('orders.delivered', 'Delivered')} value={stats.completedOrders} color="emerald" />
              <StatCard label={t('nav.wishlist', 'Saved Items')} value={stats.wishlistCount} color="rose" />
            </>
          )}
        </div>
      )}

      {/* Account Details */}
      <div className="card-saas p-6 sm:p-7 mt-6 shadow-premium">
        <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-5 font-display">{t('profile.accountInfo', 'Account Information')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem icon={FaEnvelope} label={t('auth.emailLabel', 'Email Address')} value={profile.email} />
          <DetailItem icon={FaPhone} label={t('auth.phoneLabel', 'Phone Number')} value={profile.phone || 'Not provided'} />
          <DetailItem icon={FaMapMarkerAlt} label={t('auth.locationLabel', 'Location / District')} value={profile.location || 'Gujarat'} />
          <DetailItem icon={FaCalendarAlt} label={t('common.date', 'Registration Date')} value={joinedDate} />
        </div>

        {/* Farmer-specific Information */}
        {profile.role === 'Farmer' && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 font-display">{t('profile.farmSpecs', 'Farm Specifications')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem icon={FaTractor} label={t('auth.farmNameLabel', 'Farm / Organic Enterprise')} value={profile.farmName || 'Direct Family Farm'} />
              <DetailItem icon={FaLeaf} label={t('auth.specializationLabel', 'Crop Specialization')} value={profile.specialization || 'Vegetables & Grains'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    emerald: 'bg-teal-50 text-teal-900 border-teal-200',
    rose: 'bg-rose-50 text-rose-900 border-rose-200',
  };

  return (
    <div className={`p-4 rounded-2xl border shadow-sm ${colors[color] || colors.blue}`}>
      <p className="text-2xl font-black font-display">{value}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 mt-1">{label}</p>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200">
    {Icon && <Icon className="text-brand-700 mt-1 text-sm shrink-0" />}
    <div>
      <p className="text-[10px] text-surface-500 font-extrabold uppercase tracking-wide">{label}</p>
      <p className="text-xs font-bold text-surface-800 mt-0.5">{value}</p>
    </div>
  </div>
);

export default MyProfile;
