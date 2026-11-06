import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { registerUser } from '../services/api';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, 
  FaGraduationCap, FaSeedling, FaBriefcase, FaRupeeSign, 
  FaClock, FaTractor, FaShoppingBag, FaUserMd, FaCheckCircle, FaLeaf, FaShieldAlt, FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buyer',
    phone: '',
    location: '',
    qualification: '',
    specialization: '',
    experienceYears: '',
    consultationFee: '',
    availableSlots: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };
  
  const pwStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (formData.role === 'Expert') {
        payload.experienceYears = Number(formData.experienceYears) || 0;
        payload.consultationFee = Number(formData.consultationFee) || 0;
        payload.availableSlots = formData.availableSlots
          ? formData.availableSlots.split(',').map(s => s.trim()).filter(Boolean)
          : ['10:00 AM - 11:00 AM', '03:00 PM - 04:00 PM'];
      } else {
        delete payload.qualification;
        delete payload.specialization;
        delete payload.experienceYears;
        delete payload.consultationFee;
        delete payload.availableSlots;
      }

      const data = await registerUser(payload);
      login(data, data.token);
      toast.success(`Welcome to Smart Krushi Bazar, ${data.name}! 🎉`);
      
      if (data.role === 'Farmer') navigate('/farmer/dashboard');
      else if (data.role === 'Expert') navigate('/expert/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isFieldValid = (name, value) => {
    if (!value) return false;
    if (name === 'email') return /\S+@\S+\.\S+/.test(value);
    if (name === 'password') return value.length >= 6;
    if (name === 'phone') return value.length >= 10;
    return value.length > 2;
  };

  return (
    <div className="min-h-screen flex page-fade-in bg-transparent">
      {/* LEFT HALF: Agricultural Showcase Panel with Role-Responsive Backdrop */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-950 overflow-hidden text-white flex-col justify-between p-12">
        {/* Dynamic Role Photo Overlay */}
        <img
          key={formData.role}
          src={
            formData.role === 'Farmer'
              ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1400&auto=format&fit=crop'
              : formData.role === 'Buyer'
              ? 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1400&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1400&auto=format&fit=crop'
          }
          alt="Role Showcase"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25 pointer-events-none transition-opacity duration-700"
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-harvest-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Floating SVG Icons */}
        <div className="absolute top-[12%] right-[10%] opacity-25 animate-orbit-reverse text-emerald-300 pointer-events-none">
          {formData.role === 'Farmer' ? <FaTractor size={48} /> : formData.role === 'Buyer' ? <FaShoppingBag size={48} /> : <FaUserMd size={48} />}
        </div>
        
        {/* Logo and Brand */}
        <div className="relative z-10 animate-slide-up stagger-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-6">
            <FaSeedling size={32} className="text-emerald-300 animate-pulse-slow" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black tracking-widest uppercase mb-3">
            {formData.role === 'Farmer' ? '🌾 For Farmers & Kisans' : formData.role === 'Buyer' ? '🛒 For Wholesale & Retail Buyers' : '🔬 For Agronomy Specialists'}
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black mb-4 leading-tight gradient-text bg-gradient-to-r from-emerald-200 via-white to-harvest-200 text-transparent bg-clip-text">
            {formData.role === 'Farmer' ? 'Direct Farm Trade' : formData.role === 'Buyer' ? 'Fresh Produce Sourcing' : 'Agronomy Advisory'}
          </h1>
          <p className="text-emerald-100/90 text-sm lg:text-base max-w-md font-medium leading-relaxed">
            {formData.role === 'Farmer' 
              ? 'Sell directly to verified buyers across India, check official APMC Mandi rates, and enjoy 0% broker commissions.' 
              : formData.role === 'Buyer'
              ? 'Procure fresh organic vegetables, fruits, and grains directly from registered farmers with transparent market rates.'
              : 'Advise farmers on soil chemistry, pest control, and crop health. Deliver paid 1-on-1 consultations directly.'}
          </p>
        </div>

        {/* Animated Platform Benefits */}
        <div className="relative z-10 space-y-4 animate-slide-up stagger-2">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-white/15 transition-all shadow-lg">
            <div className="p-3 bg-emerald-600/40 rounded-xl border border-emerald-400/30">
              <FaChartLine className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="text-lg font-bold font-display text-white">Direct Trade, Fair Rates</div>
              <div className="text-emerald-200/90 text-xs font-medium">0% broker commission on farm produce</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-white/15 transition-all shadow-lg">
            <div className="p-3 bg-emerald-600/40 rounded-xl border border-emerald-400/30">
              <FaGraduationCap className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="text-lg font-bold font-display text-white">Certified Specialist Advisory</div>
              <div className="text-emerald-200/90 text-xs font-medium">1-on-1 scientific guidance and disease remedies</div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="relative z-10 flex items-center gap-2 text-emerald-200/80 text-xs font-bold tracking-wider uppercase animate-slide-up stagger-3">
          <FaShieldAlt className="text-emerald-400 text-sm" /> 100% Verified Users & Encrypted Security
        </div>
      </div>

      {/* RIGHT HALF: Register Form with Luxe Styling */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-xl card-luxe p-8 sm:p-10 animate-slide-right my-auto">
          
          <div className="text-center mb-8 md:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-800 to-emerald-600 text-white rounded-2xl shadow-md shadow-brand-900/20 mb-3 animate-float">
              <FaSeedling size={26} className="text-emerald-100" />
            </div>
            <h1 className="page-heading text-2xl sm:text-3xl font-display">{t('auth.registerTitle', 'Join Smart Krushi Bazar')}</h1>
            <p className="text-xs text-surface-500 font-medium mt-1">{t('auth.registerDesc', 'Create your verified account and access the digital agri-marketplace.')}</p>
          </div>
          
          <div className="hidden md:block text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {t('auth.freeAccountCreation', 'Free Account Creation')}
            </div>
            <h2 className="text-3xl font-display font-black text-surface-900">{t('auth.registerTitle', 'Create Account')}</h2>
            <p className="text-sm text-surface-500 font-medium mt-1">{t('auth.registerDesc', 'Fill in your details to get started on the platform')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-3 font-display">{t('auth.roleLabel', 'Select Your Platform Role')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { role: 'Buyer', icon: FaShoppingBag, label: t('roles.buyer', 'Buyer'), desc: t('roles.buyerDesc', 'Purchase Produce') },
                  { role: 'Farmer', icon: FaTractor, label: t('roles.farmer', 'Farmer'), desc: t('roles.farmerDesc', 'Sell Farm Crops') },
                  { role: 'Expert', icon: FaUserMd, label: t('roles.expert', 'Expert'), desc: t('roles.expertDesc', 'Agronomy Doctor') }
                ].map(({ role, icon: Icon, label, desc }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${
                      formData.role === role 
                        ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-md animate-glow' 
                        : 'border-surface-200 text-surface-500 hover:border-brand-300 hover:bg-surface-50'
                    }`}
                  >
                    {formData.role === role && (
                      <div className="absolute -top-2 -right-2 bg-brand-600 text-white rounded-full p-0.5 shadow-sm animate-scale-in">
                        <FaCheckCircle size={16} />
                      </div>
                    )}
                    <Icon size={24} className={formData.role === role ? 'text-brand-600' : 'text-surface-400 group-hover:text-brand-400 transition-colors'} />
                    <div className="text-center">
                      <div className="font-display font-bold text-sm">{label}</div>
                      <div className="text-[10px] font-medium opacity-80 mt-0.5">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputIcon icon={FaUser} name="name" placeholder={t('auth.fullNamePlaceholder', 'Full Legal Name')} value={formData.name} onChange={handleChange} isValid={isFieldValid('name', formData.name)} required />
              <InputIcon icon={FaEnvelope} name="email" type="email" placeholder={t('auth.emailPlaceholder', 'Email Address')} value={formData.email} onChange={handleChange} isValid={isFieldValid('email', formData.email)} required />
              
              <div className="relative">
                <InputIcon icon={FaLock} name="password" type="password" placeholder={t('auth.passwordPlaceholder', 'Password (Min 6 chars)')} value={formData.password} onChange={handleChange} isValid={isFieldValid('password', formData.password)} required />
                {formData.password && (
                  <div className="absolute -bottom-3 left-0 w-full flex gap-1 px-1">
                    <div className={`h-1 flex-1 rounded-full ${pwStrength >= 1 ? (pwStrength >= 2 ? (pwStrength >= 3 ? 'bg-green-500' : 'bg-amber-400') : 'bg-red-400') : 'bg-surface-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${pwStrength >= 2 ? (pwStrength >= 3 ? 'bg-green-500' : 'bg-amber-400') : 'bg-surface-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${pwStrength >= 3 ? 'bg-green-500' : 'bg-surface-200'}`}></div>
                  </div>
                )}
              </div>

              <InputIcon icon={FaPhone} name="phone" placeholder={t('auth.phonePlaceholder', 'Mobile Contact Number')} value={formData.phone} onChange={handleChange} isValid={isFieldValid('phone', formData.phone)} required />
              <div className="md:col-span-2">
                <InputIcon icon={FaMapMarkerAlt} name="location" placeholder={t('auth.locationPlaceholder', 'City / District / State (e.g. Navsari, Gujarat)')} value={formData.location} onChange={handleChange} isValid={isFieldValid('location', formData.location)} required />
              </div>
            </div>

            {/* Expert Specific Fields (Animated Reveal) */}
            {formData.role === 'Expert' && (
              <div className="p-6 bg-brand-50/50 rounded-3xl border border-brand-200 space-y-4 animate-scale-up mt-6">
                <h3 className="text-sm font-bold text-brand-900 font-display flex items-center gap-2">
                  <FaGraduationCap className="text-brand-700" /> {t('auth.agronomistCredentials', 'Agronomist Credentials & Advisory Terms')}
                </h3>
                <p className="text-[11px] text-surface-500 font-medium">{t('auth.agronomistCredentialsDesc', 'Specify your agricultural qualifications and consultation rates.')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputIcon icon={FaGraduationCap} name="qualification" placeholder={t('auth.qualificationPlaceholder', 'Degree (e.g. M.Sc. Agronomy, Ph.D.)')} value={formData.qualification} onChange={handleChange} isValid={isFieldValid('qualification', formData.qualification)} required />
                  <InputIcon icon={FaSeedling} name="specialization" placeholder={t('auth.specializationPlaceholder', 'Specialization (e.g. Soil & Plant Pathology)')} value={formData.specialization} onChange={handleChange} isValid={isFieldValid('specialization', formData.specialization)} required />
                  <InputIcon icon={FaBriefcase} name="experienceYears" type="number" placeholder={t('auth.experiencePlaceholder', 'Experience in Years (e.g. 7)')} value={formData.experienceYears} onChange={handleChange} isValid={isFieldValid('experienceYears', formData.experienceYears)} required />
                  <InputIcon icon={FaRupeeSign} name="consultationFee" type="number" placeholder={t('auth.feePlaceholder', 'Session Fee in ₹ (0 for Free)')} value={formData.consultationFee} onChange={handleChange} isValid={isFieldValid('consultationFee', formData.consultationFee)} required />
                  <div className="md:col-span-2">
                    <InputIcon icon={FaClock} name="availableSlots" placeholder={t('auth.slotsPlaceholder', 'Slots (e.g. 10:00 AM - 11:00 AM, 03:00 PM - 04:00 PM)')} value={formData.availableSlots} onChange={handleChange} isValid={isFieldValid('availableSlots', formData.availableSlots)} required />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-saas-primary text-sm !py-4 mt-6 shadow-md hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50 font-bold font-display">
              {loading ? t('auth.creatingAccount', 'Creating Verified Account...') : t('auth.createAccountBtn', 'Complete Registration')}
            </button>
          </form>

          <p className="text-center mt-8 text-xs text-surface-500 font-medium pt-6 border-t border-surface-100">
            {t('auth.alreadyHaveAccount', 'Already registered on Smart Krushi Bazar?')} <Link to="/login" className="text-brand-700 font-bold hover:text-brand-900 hover:underline transition-colors">{t('auth.loginLink', 'Sign In here')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component with Icon and Validation Check
const InputIcon = ({ icon: Icon, isValid, ...props }) => (
  <div className="relative">
    <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isValid ? 'text-brand-500' : 'text-surface-400'}`} />
    <input 
      {...props} 
      className={`input-saas !pl-10 text-xs font-medium w-full transition-all focus:ring-2 focus:ring-brand-500/20 ${isValid ? 'border-brand-300 bg-brand-50/10' : ''}`} 
    />
    {isValid && (
      <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 text-xs animate-scale-in" />
    )}
  </div>
);

export default Register;
