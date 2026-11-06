import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from '../components/Avatar';
import BackButton from '../components/BackButton';
import { getMyProfile, updateProfile, uploadProfilePhoto, removeProfilePhoto } from '../services/profileService';
import { FaCamera, FaTrash, FaSave, FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaTractor, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const { t } = useLanguage();
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    farmName: '',
    specialization: ''
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const p = data.data;
        setProfile(p);
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          farmName: p.farmName || '',
          specialization: p.specialization || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    
    setPreview(URL.createObjectURL(file));
    uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append('profileImage', file);
      const result = await uploadProfilePhoto(data);
      
      const updatedUser = { ...user, profileImage: result.data.profileImage };
      login(updatedUser, localStorage.getItem('token'));
      setProfile(prev => ({ ...prev, profileImage: result.data.profileImage }));
      setPreview(null);
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeProfilePhoto();
      const updatedUser = { ...user, profileImage: null };
      login(updatedUser, localStorage.getItem('token'));
      setProfile(prev => ({ ...prev, profileImage: null }));
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error('Failed to remove photo');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await updateProfile(formData);
      const updatedUser = { ...user, ...result.data };
      login(updatedUser, localStorage.getItem('token'));
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card-saas h-96 skeleton-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="page-fade-in max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <BackButton fallback="/profile" label={t('nav.profile', 'Back to Profile')} />
        <button onClick={() => navigate('/profile')} className="btn-saas-secondary !py-2 !px-4 text-xs">
          <FaTimes className="mr-1" /> {t('common.cancel', 'Cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="card-saas p-6 shadow-premium">
          <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4 font-display">{t('profile.profileImage', 'Profile Image')}</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar src={preview || profile?.profileImage} name={profile?.name} size="2xl" className="ring-2 ring-emerald-200" />
              {uploading && (
                <div className="absolute inset-0 bg-surface-950/60 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-saas-primary text-xs !py-2 !px-4 shadow-sm"
                disabled={uploading}
              >
                <FaCamera className="mr-1.5" /> {profile?.profileImage ? t('profile.changePhoto', 'Change Photo') : t('profile.uploadPhoto', 'Upload Photo')}
              </button>
              {profile?.profileImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn-saas-secondary text-xs !py-2 !px-4 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FaTrash className="mr-1.5" /> {t('common.delete', 'Remove')}
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            aria-label="Upload profile photo"
          />
        </div>

        {/* Basic Info */}
        <div className="card-saas p-6 shadow-premium space-y-4">
          <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 font-display">{t('profile.accountInfo', 'Personal Details')}</h2>
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('auth.fullNameLabel', 'Full Legal Name')} *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-saas text-xs font-medium"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('auth.phoneLabel', 'Mobile Contact')} *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input-saas text-xs font-medium"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('auth.locationLabel', 'City / State / District')} *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="input-saas text-xs font-medium"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('profile.bioLabel', 'Biography')}</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="input-saas resize-none text-xs font-medium"
              placeholder="Tell buyers or fellow farmers about your farm and crop experience..."
            />
            <p className="text-[10px] text-surface-400 mt-1">{formData.bio.length}/500 characters</p>
          </div>
        </div>

        {/* Farmer-specific fields */}
        {profile?.role === 'Farmer' && (
          <div className="card-saas p-6 shadow-premium space-y-4">
            <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 font-display">{t('profile.farmSpecs', 'Agricultural Farm Information')}</h2>
            <div>
              <label htmlFor="farmName" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('auth.farmNameLabel', 'Farm Name')}</label>
              <input
                id="farmName"
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                placeholder="e.g. Green Valley Organic Farms"
                className="input-saas text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1 font-display">{t('auth.specializationLabel', 'Farming Specialization')}</label>
              <input
                id="specialization"
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Organic Mangoes, Hybrid Cotton, Grains"
                className="input-saas text-xs font-medium"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-saas-primary text-xs !py-3.5 shadow-sm font-bold flex items-center justify-center gap-2"
        >
          <FaSave /> {saving ? t('profile.saving', 'Saving Updates...') : t('profile.saveChanges', 'Save Profile Changes')}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
