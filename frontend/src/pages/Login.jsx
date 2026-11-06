import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loginUser } from '../services/api';
import { FaSeedling, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTractor, FaShoppingBasket, FaUserMd, FaUserShield, FaLeaf, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      login(data, data.token);
      toast.success(t('common.welcomeUser', { name: data.name.split(' ')[0] }));
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'Farmer') {
        navigate('/farmer/dashboard');
      } else if (data.role === 'Expert') {
        navigate('/expert/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error', 'Invalid email or password');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (roleEmail, rolePass, roleName) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    toast.success(`${roleName} credentials loaded!`, { id: 'demo-fill' });
  };

  return (
    <div className="min-h-screen flex page-fade-in bg-transparent">
      {/* LEFT HALF: Agricultural Showcase Panel with Lush Photo Backdrop */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-950 overflow-hidden text-white flex-col justify-between p-12">
        {/* Real Farm Texture Overlay */}
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1400&auto=format&fit=crop"
          alt="Lush Harvest"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 pointer-events-none"
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-harvest-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Floating SVG Icons */}
        <div className="absolute top-[12%] right-[15%] opacity-30 animate-orbit text-emerald-300 pointer-events-none">
          <FaSeedling size={48} />
        </div>
        <div className="absolute bottom-[20%] left-[15%] opacity-20 animate-float text-emerald-200 pointer-events-none">
          <FaTractor size={72} />
        </div>
        
        {/* Logo and Brand */}
        <div className="relative z-10 animate-slide-up stagger-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-6 group">
            <FaSeedling size={32} className="text-emerald-300 animate-pulse-slow" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black tracking-widest uppercase mb-3">
            Next-Gen AgriTech Platform
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black mb-4 leading-tight gradient-text bg-gradient-to-r from-emerald-200 via-white to-harvest-200 text-transparent bg-clip-text">
            Smart Krushi Bazar
          </h1>
          <p className="text-emerald-100/90 text-sm lg:text-base max-w-md font-medium leading-relaxed">
            Direct farmer-to-buyer trade, official APMC Mandi rates, and AI plant health intelligence — all in one unified ecosystem.
          </p>
        </div>

        {/* Animated Platform Stats */}
        <div className="relative z-10 space-y-4 animate-slide-up stagger-2">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-white/15 transition-all shadow-lg">
            <div className="p-3 bg-emerald-600/40 rounded-xl border border-emerald-400/30">
              <FaTractor className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="text-2xl font-black font-display text-white">10,000+</div>
              <div className="text-emerald-200/90 text-xs font-bold uppercase tracking-wider">Registered Indian Farmers</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-white/15 transition-all shadow-lg">
            <div className="p-3 bg-emerald-600/40 rounded-xl border border-emerald-400/30">
              <FaUserMd className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="text-2xl font-black font-display text-white">500+</div>
              <div className="text-emerald-200/90 text-xs font-bold uppercase tracking-wider">Certified Agronomy Experts</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-white/15 transition-all shadow-lg">
            <div className="p-3 bg-emerald-600/40 rounded-xl border border-emerald-400/30">
              <FaLeaf className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="text-2xl font-black font-display text-white">24/7</div>
              <div className="text-emerald-200/90 text-xs font-bold uppercase tracking-wider">Instant AI Crop Diagnostics</div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="relative z-10 flex items-center gap-2 text-emerald-200/80 text-xs font-bold tracking-wider uppercase animate-slide-up stagger-3">
          <FaShieldAlt className="text-emerald-400 text-sm" /> 100% Verified Agriculture Network
        </div>
      </div>

      {/* RIGHT HALF: Login Form with Luxe Styling */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md card-luxe p-8 sm:p-10 animate-slide-right">
          
          {/* Mobile Brand Icon Header */}
          <div className="text-center mb-8 md:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-800 to-emerald-600 text-white rounded-2xl shadow-md shadow-brand-900/20 mb-3 animate-float">
              <FaSeedling size={26} className="text-emerald-100" />
            </div>
            <h1 className="page-heading text-2xl font-display">{t('auth.welcomeBack', 'Welcome Back')}</h1>
            <p className="text-xs text-surface-500 font-medium mt-1">{t('auth.welcomeBackDesc', 'Sign in to your Smart Krushi Bazar portal')}</p>
          </div>

          <div className="hidden md:block text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {t('common.verified', 'Secure Portal Access')}
            </div>
            <h2 className="text-3xl font-display font-black text-surface-900">{t('auth.signInTitle', 'Sign In')}</h2>
            <p className="text-sm text-surface-500 font-medium mt-2">{t('auth.signInDesc', 'Access your personalized agricultural dashboard')}</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">{t('auth.emailLabel', 'Email Address')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3.5 text-surface-400 text-xs" />
                <input
                  type="email"
                  placeholder={t('auth.emailPlaceholder', 'name@krushibazar.in')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-saas !pl-10 text-xs font-medium w-full focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">{t('auth.passwordLabel', 'Password')}</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-surface-400 text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder', '••••••••')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-saas !pl-10 !pr-10 text-xs font-medium w-full focus:ring-2 focus:ring-brand-500/20"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-surface-400 hover:text-brand-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-saas-primary text-xs !py-3.5 mt-3 shadow-sm disabled:opacity-50"
            >
              {loading ? t('auth.signingIn', 'Authenticating...') : t('auth.signInBtn', 'Sign In to Portal')}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-surface-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-surface-400 font-medium uppercase tracking-widest font-display">{t('auth.fastDemoTitle', 'Fast Demo Login')}</span>
              <div className="flex-grow border-t border-surface-200"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              <button 
                type="button" 
                onClick={() => handleDemoLogin('hetnaik178@gmail.com', 'het@171925', t('roles.farmer', 'Farmer'))}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Fill Farmer: hetnaik178@gmail.com"
              >
                <FaTractor className="text-emerald-600" /> {t('roles.farmer', 'Farmer')}
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('naikmeet2535@gmail.com', 'naikmeet2535', t('roles.buyer', 'Buyer'))}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Fill Buyer: naikmeet2535@gmail.com"
              >
                <FaShoppingBasket className="text-blue-600" /> {t('roles.buyer', 'Buyer')}
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('jeet@gmail.com', 'jeet123', t('roles.expert', 'Expert'))}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Fill Expert: jeet@gmail.com"
              >
                <FaUserMd className="text-purple-600" /> {t('roles.expert', 'Expert')}
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('admin@krushi.com', 'Admin@123', t('roles.admin', 'Admin'))}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Fill Admin: admin@krushi.com"
              >
                <FaUserShield className="text-amber-600" /> {t('roles.admin', 'Admin')}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-surface-500 font-medium">
            {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:text-brand-900 hover:underline">
              {t('auth.registerLink', 'Register as Farmer or Buyer')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
