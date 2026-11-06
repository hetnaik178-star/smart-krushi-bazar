import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';
import WeatherWidget from './WeatherWidget';
import { 
  FaBars, FaTimes, FaShoppingCart, FaSeedling, FaComments, FaTractor, 
  FaUserMd, FaHome, FaStore, FaChartLine, FaMicroscope, FaShieldAlt,
  FaPhoneAlt, FaLeaf, FaArrowRight, FaSignInAlt, FaCheckCircle, FaGlobe,
  FaCalculator, FaLandmark, FaSignOutAlt, FaChevronDown, FaTools,
  FaBoxes, FaTruck
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext) || { totalItems: 0 };
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsDropdownRef = useRef(null);
  const toolsTimeoutRef = useRef(null);

  const handleToolsMouseEnter = () => {
    if (toolsTimeoutRef.current) {
      clearTimeout(toolsTimeoutRef.current);
      toolsTimeoutRef.current = null;
    }
    setToolsOpen(true);
  };

  const handleToolsMouseLeave = () => {
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    toolsTimeoutRef.current = setTimeout(() => {
      setToolsOpen(false);
    }, 200);
  };

  const handleToolsToggle = (e) => {
    e.stopPropagation();
    if (toolsTimeoutRef.current) {
      clearTimeout(toolsTimeoutRef.current);
      toolsTimeoutRef.current = null;
    }
    setToolsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { 
    setMobileOpen(false); 
    setToolsOpen(false);
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Role-Specific Smart Tools Configuration
  const getSmartToolsConfig = () => {
    // 1. BUYER: Only tools relevant to commercial crop sourcing & logistics
    if (user?.role === 'Buyer') {
      return {
        title: language === 'gu' ? 'ખરીદદાર સ્માર્ટ ટૂલ્સ' : language === 'hi' ? 'खरीदार स्मार्ट टूल्स' : 'Buyer Sourcing Tools',
        badge: '4 Tools',
        tools: [
          {
            name: language === 'gu' ? 'નૂર અને ટ્રાન્સપોર્ટ ગણક' : language === 'hi' ? 'मालभाड़ा कैलकुलेटर' : 'Freight & Transport Calc',
            path: '/freight-calc',
            key: 'freight',
            tag: 'Logistics',
            icon: <FaTruck className="text-amber-600 text-sm" />,
            desc: language === 'gu' ? 'ખેતરથી ગોડાઉન/દુકાન સુધી વાહન અને માલભાડું ગણો' : language === 'hi' ? 'खेत से दुकान/गोदाम तक टेम्पो व ट्रक भाड़ा' : 'Farm-to-Door Vehicle & Freight Cost'
          },
          {
            name: language === 'gu' ? 'ડિજિટલ પાક પાસપોર્ટ' : language === 'hi' ? 'डिजिटल फसल पासपोर्ट' : 'Digital Crop Passport',
            path: '/passport',
            key: 'passport',
            tag: 'Quality & QR',
            icon: <FaShieldAlt className="text-emerald-600 text-sm" />,
            desc: language === 'gu' ? 'ગુણવત્તા, લેબ રિપોર્ટ અને બેચ શુદ્ધતા ચકાસો' : language === 'hi' ? 'बैच गुणवत्ता, लैब रिपोर्ट व शुद्धता प्रमाणपत्र जांचें' : 'Verify Batch Quality, Residue & Farm Origin'
          },
          {
            name: language === 'gu' ? 'થોક પાક ખરીદી માગ' : language === 'hi' ? 'थोक फसल खरीद मांग' : 'B2B Bulk Crop Demand',
            path: '/buyer/bulk-demand',
            key: 'demand',
            tag: '0% Broker',
            icon: <FaBoxes className="text-emerald-600 text-sm" />,
            desc: language === 'gu' ? 'જથ્થાબંધ પાક ખરીદ માગણી અને 0% વચેટિયા બચત' : language === 'hi' ? 'थोक खरीद मांग दर्ज करें एवं 0% बिचौलिया बचत पाएं' : 'Direct Wholesale Requisitions with Zero Markup'
          },
          {
            name: t('nav.mandiPrices', 'Mandi Prices'),
            path: '/mandi',
            key: 'mandi',
            tag: 'APMC Live',
            icon: <FaChartLine className="text-teal-600 text-sm" />,
            desc: language === 'gu' ? 'દૈનિક જથ્થાબંધ માર્કેટ યાર્ડ ભાવ અને વિશ્લેષણ' : language === 'hi' ? 'दैनिक थोक मंडी भाव, न्यूनतम व अधिकतम दरें' : 'Daily APMC Wholesale Price Indices & Trends'
          }
        ]
      };
    }

    // 2. EXPERT: Agronomy & diagnostic advisory tools
    if (user?.role === 'Expert') {
      return {
        title: language === 'gu' ? 'નિષ્ણાત સલાહ ટૂલ્સ' : language === 'hi' ? 'विशेषज्ञ परामर्श टूल्स' : 'Agronomy Advisory Tools',
        badge: '3 Tools',
        tools: [
          {
            name: t('nav.aiCropDoctor', 'AI Crop Doctor'),
            path: '/disease',
            key: 'disease',
            tag: 'Diagnostics',
            icon: <FaMicroscope className="text-cyan-600 text-sm" />,
            desc: language === 'gu' ? 'પાકના રોગનું તાત્કાલિક કેમેરા નિદાન' : language === 'hi' ? 'फसल रोग का तुरंत कैमरा निदान' : 'Instant Leaf Disease Diagnostic'
          },
          {
            name: t('nav.cropAdvisor', 'Crop Advisor'),
            path: '/crop-advisor',
            key: 'advisor',
            tag: 'Soil AI',
            icon: <FaLeaf className="text-emerald-600 text-sm" />,
            desc: language === 'gu' ? 'જમીન અને NPK આધારિત પાક સલાહ' : language === 'hi' ? 'मिट्टी एवं NPK आधारित फसल सलाह' : 'AI Soil & NPK Crop Advisory'
          },
          {
            name: t('nav.govtSchemes', 'Govt Schemes'),
            path: '/schemes',
            key: 'schemes',
            tag: 'Policy',
            icon: <FaLandmark className="text-purple-600 text-sm" />,
            desc: language === 'gu' ? 'સરકારી સબસિડી અને આઈ-ખેડૂત પોર્ટલ' : language === 'hi' ? 'सरकारी सब्सिडी और पोर्टल' : 'Central & Gujarat Subsidies'
          }
        ]
      };
    }

    // 3. FARMER & GUEST: Complete agricultural toolset
    return {
      title: language === 'gu' ? 'કૃષિ ઇનોવેશન ટૂલ્સ' : language === 'hi' ? 'कृषि नवोन्मेष टूल्स' : 'AgriTech Innovation Tools',
      badge: '6 Tools',
      tools: [
        { 
          name: t('nav.cropAdvisor', 'Crop Advisor'), 
          path: '/crop-advisor', 
          key: 'advisor',
          tag: 'AI Soil',
          icon: <FaLeaf className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'જમીન અને NPK આધારિત પાક સલાહ' : language === 'hi' ? 'मिट्टी एवं NPK आधारित फसल सलाह' : 'AI Soil & NPK Crop Advisory'
        },
        { 
          name: t('nav.aiCropDoctor', 'AI Crop Doctor'), 
          path: '/disease', 
          key: 'disease',
          tag: '24/7 AI',
          icon: <FaMicroscope className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'પાકના રોગનું તાત્કાલિક કેમેરા નિદાન' : language === 'hi' ? 'फसल रोग का तुरंत कैमरा निदान' : 'Instant Leaf Disease Diagnostic'
        },
        { 
          name: t('nav.fertilizerCalc', 'Fertilizer Calc'), 
          path: '/fertilizer-calc', 
          key: 'calc',
          tag: 'Dosage',
          icon: <FaCalculator className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'એકર દીઠ યુરિયા, DAP, પોટાશ ગણક' : language === 'hi' ? 'प्रति एकड़ यूरिया, DAP, पोटाश गणना' : 'Acreage Fertilizer & Seed Dosage'
        },
        { 
          name: t('nav.govtSchemes', 'Govt Schemes'), 
          path: '/schemes', 
          key: 'schemes',
          tag: 'Govt',
          icon: <FaLandmark className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'સરકારી સબસિડી અને આઈ-ખેડૂત પોર્ટલ' : language === 'hi' ? 'सरकारी सब्सिडी और पोर्टल' : 'Central & Gujarat Subsidies'
        },
        { 
          name: language === 'gu' ? 'નૂર અને ટ્રાન્સપોર્ટ ગણક' : language === 'hi' ? 'मालभाड़ा कैलकुलेटर' : 'Freight & Transport Calc', 
          path: '/freight-calc', 
          key: 'freight',
          tag: 'Doorstep',
          icon: <FaTruck className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'ખેતરેથી ઘર સુધી વાહન અને પરિવહન ભાડું' : language === 'hi' ? 'खेत से घर/दुकान तक टेम्पो व ट्रक भाड़ा' : 'Farm-to-Door Vehicle & Freight Cost'
        },
        { 
          name: language === 'gu' ? 'ડિજિટલ પાક પાસપોર્ટ' : language === 'hi' ? 'डिजिटल फसल पासपोर्ट' : 'Digital Crop Passport', 
          path: '/passport', 
          key: 'passport',
          tag: 'QR Trace',
          icon: <FaShieldAlt className="text-emerald-600 text-sm" />,
          desc: language === 'gu' ? 'QR કોડ દ્વારા બેચ ગુણવત્તા અને ચકાસણી' : language === 'hi' ? 'QR कोड द्वारा बैच गुणवत्ता व ट्रेसिबिलिटी' : 'Farm-to-Fork Batch Traceability & QR'
        }
      ]
    };
  };

  const currentToolsConfig = getSmartToolsConfig();
  const smartToolsList = currentToolsConfig.tools;
  const isToolsActive = smartToolsList.some(item => location.pathname === item.path);

  // Role-Based Navigation (Compact main menu)
  const getNavLinks = () => {
    const base = [
      { name: t('nav.marketplace', 'Marketplace'), path: '/products', key: 'marketplace' },
      { name: t('nav.mandiPrices', 'Mandi Prices'), path: '/mandi', key: 'mandi' }
    ];
    if (!user) return [...base, { name: t('nav.findExperts', 'Find Experts'), path: '/experts', key: 'experts' }];
    if (user.role === 'Farmer') return [
      ...base, 
      { name: t('nav.findExperts', 'Find Experts'), path: '/experts', key: 'experts' }, 
      { name: t('nav.aiCropDoctor', 'AI Crop Doctor'), path: '/disease', key: 'disease' }, 
      { name: t('nav.dashboard', 'Dashboard'), path: '/farmer/dashboard', key: 'dashboard' }
    ];
    if (user.role === 'Buyer') return [
      ...base, 
      { name: t('buyer.bulkDemandNav', 'Bulk Demand'), path: '/buyer/bulk-demand', key: 'demand' },
      { name: t('nav.myOrders', 'My Orders'), path: '/buyer/orders', key: 'orders' },
      { name: t('nav.dashboard', 'Dashboard'), path: '/buyer/dashboard', key: 'dashboard' }
    ];
    if (user.role === 'Expert') return [
      { name: t('nav.dashboard', 'Dashboard'), path: '/expert/dashboard', key: 'dashboard' }, 
      { name: t('nav.consultations', 'Consultations'), path: '/expert/consultations', key: 'consultations' },
      { name: t('nav.messages', 'Messages'), path: '/expert/messages', key: 'consultations' },
      { name: t('nav.mandiPrices', 'Mandi Prices'), path: '/mandi', key: 'mandi' }
    ];
    if (user.role === 'Admin') return [
      { name: t('nav.adminPanel', 'Admin Panel'), path: '/admin/dashboard', key: 'admin' },
      ...base
    ];
    return base;
  };

  const navLinks = getNavLinks();

  // Market & Role Specific Links for Mobile Drawer
  const getMarketAndRoleLinks = () => {
    const base = [
      { name: t('nav.marketplace', 'Marketplace'), path: '/products', key: 'marketplace' },
      { name: t('nav.mandiPrices', 'Mandi Prices'), path: '/mandi', key: 'mandi' },
      { name: t('nav.findExperts', 'Find Experts'), path: '/experts', key: 'experts' }
    ];
    if (!user) return base;
    if (user.role === 'Farmer') return [
      ...base,
      { name: t('nav.dashboard', 'Farmer Dashboard'), path: '/farmer/dashboard', key: 'dashboard' },
      { name: language === 'gu' ? 'મારા ઓર્ડર્સ' : language === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders', path: '/farmer/orders', key: 'orders' }
    ];
    if (user.role === 'Buyer') return [
      ...base,
      { name: t('buyer.bulkDemandNav', 'Bulk Demand'), path: '/buyer/bulk-demand', key: 'demand' },
      { name: t('nav.myOrders', 'My Orders'), path: '/buyer/orders', key: 'orders' },
      { name: t('nav.dashboard', 'Buyer Dashboard'), path: '/buyer/dashboard', key: 'dashboard' }
    ];
    if (user.role === 'Expert') return [
      { name: t('nav.dashboard', 'Expert Dashboard'), path: '/expert/dashboard', key: 'dashboard' },
      { name: t('nav.consultations', 'Consultations'), path: '/expert/consultations', key: 'consultations' },
      { name: t('nav.messages', 'Messages'), path: '/expert/messages', key: 'consultations' },
      { name: t('nav.mandiPrices', 'Mandi Prices'), path: '/mandi', key: 'mandi' }
    ];
    if (user.role === 'Admin') return [
      { name: t('nav.adminPanel', 'Admin Panel'), path: '/admin/dashboard', key: 'admin' },
      ...base
    ];
    return base;
  };

  const marketAndRoleLinks = getMarketAndRoleLinks();

  const getIconForLink = (key) => {
    switch(key) {
      case 'marketplace': return <FaStore className="text-[13px]" />;
      case 'mandi': return <FaChartLine className="text-[13px]" />;
      case 'demand': return <FaBoxes className="text-[13px]" />;
      case 'orders': return <FaTruck className="text-[13px]" />;
      case 'advisor': return <FaLeaf className="text-[13px]" />;
      case 'calc': return <FaCalculator className="text-[13px]" />;
      case 'schemes': return <FaLandmark className="text-[13px]" />;
      case 'freight': return <FaTruck className="text-[13px]" />;
      case 'passport': return <FaShieldAlt className="text-[13px]" />;
      case 'experts': return <FaUserMd className="text-[13px]" />;
      case 'disease': return <FaMicroscope className="text-[13px]" />;
      case 'dashboard': return <FaTractor className="text-[13px]" />;
      case 'consultations': return <FaComments className="text-[13px]" />;
      case 'admin': return <FaShieldAlt className="text-[13px]" />;
      default: return <FaHome className="text-[13px]" />;
    }
  };

  // Role Badges Configuration
  const getRoleTheme = (role) => {
    switch(role) {
      case 'Farmer':
        return {
          icon: '🌾',
          label: t('roles.farmer', 'Kisan'),
          badgeClass: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
          ringClass: 'ring-emerald-400',
        };
      case 'Buyer':
        return {
          icon: '🛒',
          label: t('roles.buyer', 'Buyer'),
          badgeClass: 'bg-amber-500/15 text-amber-900 border-amber-500/30',
          ringClass: 'ring-amber-400',
        };
      case 'Expert':
        return {
          icon: '🔬',
          label: t('roles.expert', 'Doctor'),
          badgeClass: 'bg-cyan-500/15 text-cyan-900 border-cyan-500/30',
          ringClass: 'ring-cyan-400',
        };
      case 'Admin':
        return {
          icon: '🛡️',
          label: t('roles.admin', 'Admin'),
          badgeClass: 'bg-purple-500/15 text-purple-900 border-purple-500/30',
          ringClass: 'ring-purple-400',
        };
      default:
        return {
          icon: '🌱',
          label: 'User',
          badgeClass: 'bg-surface-100 text-surface-800 border-surface-200',
          ringClass: 'ring-surface-300',
        };
    }
  };

  const roleTheme = user ? getRoleTheme(user.role) : null;

  return (
    <header className="sticky top-1 sm:top-2.5 z-50 px-2 sm:px-4 lg:px-6 max-w-[1360px] mx-auto w-full transition-all duration-300">
      {/* ── Top Micro-Utility Ticker Ribbon (Collapses on scroll) ── */}
      <div 
        className={`transition-all duration-300 ease-out overflow-hidden hidden sm:block ${
          scrolled 
            ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none mb-0' 
            : 'max-h-12 opacity-100 translate-y-0 mb-1.5'
        }`}
      >
        <div className="flex justify-between items-center px-4 py-1.5 rounded-2xl bg-emerald-950/85 backdrop-blur-xl border border-emerald-500/30 text-[11px] text-emerald-100/90 shadow-md">
          {/* Left: Mission badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full tricolor-glow animate-pulse" title="Bharat AgriTech Initiative" />
            <span className="font-bold text-white flex items-center gap-1">
              <FaLeaf className="text-emerald-400 text-[10px]" />
              {t('nav.agritechMission', 'AgriTech Bharat Mission')}
            </span>
            <span className="text-emerald-400/60">•</span>
            <span className="text-emerald-200/80 font-medium hidden md:inline">
              {t('nav.directEcosystem', 'Direct Farmer-to-Buyer Ecosystem')}
            </span>
          </div>

          {/* Center: Live GPS Weather & APMC Live Feed */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-400/20 text-[10px] font-bold text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>{t('nav.liveSync', 'AGMARKNET Live Sync')}</span>
            </div>

            {/* Real-Time Location Weather Component */}
            <WeatherWidget />
          </div>

          {/* Right: National Kisan Helpline */}
          <div className="flex items-center gap-3">
            <a 
              href="tel:18001801551" 
              className="flex items-center gap-1.5 text-harvest-300 hover:text-white font-bold transition-colors group"
            >
              <FaPhoneAlt className="text-[9px] text-harvest-400 group-hover:animate-bounce" />
              <span>{t('nav.kisanHelpline', 'Kisan Helpline')}: 1800-180-1551</span>
            </a>
            <span className="text-emerald-400/40 hidden md:inline">•</span>
            <span className="text-[10px] text-emerald-300/80 font-semibold hidden md:flex items-center gap-1">
              <FaCheckCircle className="text-emerald-400 text-[9px]" /> {t('nav.middlemanGuarantee', '0% Middleman Cut')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Floating Cyber-Agri Glass Dock ── */}
      <div className={`nav-glass-dock rounded-2xl sm:rounded-3xl ${
        scrolled ? 'scrolled py-2 px-3 sm:px-5' : 'py-2 px-3 sm:py-2.5 sm:px-5'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          
          {/* Brand Logo with 3D Leaf Aura */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group select-none shrink-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#10b981] rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-all duration-300 border border-emerald-300/40">
                <FaSeedling className="text-base sm:text-xl text-emerald-100 leaf-gleam" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex flex-col shrink-0">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-base sm:text-2xl text-surface-900 tracking-tight leading-none">
                  Smart<span className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Krushi</span>
                </span>
                <span className="text-harvest-700 text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-100 via-harvest-100 to-amber-200 font-extrabold border border-amber-300 shadow-sm">
                  Bazar
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-surface-500 tracking-widest uppercase mt-0.5 hidden sm:block">
                {t('nav.directEcosystem', 'Direct Krushi Ecosystem')}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Segmented Capsule) */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5 bg-surface-100/70 p-1 rounded-2xl border border-surface-200/70 backdrop-blur-md shadow-inner flex-1 min-w-0 mx-auto max-w-fit">
            {/* 1. First 2 core links: Marketplace & Mandi */}
            {navLinks.slice(0, 2).map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-800 via-emerald-700 to-emerald-600 text-white shadow-md shadow-brand-900/25 scale-[1.02]'
                      : 'text-surface-700 hover:text-brand-900 hover:bg-white/80'
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-200' : 'text-surface-400 group-hover:text-emerald-600'
                  }`}>
                    {getIconForLink(link.key)}
                  </span>
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                  )}
                </Link>
              );
            })}

            {/* 2. Smart Tools Dropdown (Rendered for All Users) */}
            <div 
              ref={toolsDropdownRef}
              className="relative"
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
            >
              <button
                type="button"
                onClick={handleToolsToggle}
                className={`group relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                  isToolsActive
                    ? 'bg-gradient-to-r from-brand-800 via-emerald-700 to-emerald-600 text-white shadow-md shadow-brand-900/25 scale-[1.02]'
                    : 'text-surface-700 hover:text-brand-900 hover:bg-white/80'
                }`}
              >
                <span className={`transition-transform group-hover:scale-110 ${
                  isToolsActive ? 'text-emerald-200' : 'text-surface-400 group-hover:text-emerald-600'
                }`}>
                  <FaTools className="text-[12px]" />
                </span>
                <span>{t('nav.smartTools', 'Smart Tools')}</span>
                <FaChevronDown className={`text-[9px] transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
                {isToolsActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>

              {/* Dropdown Card with seamless hover bridge */}
              {toolsOpen && (
                <div 
                  className="absolute top-full left-0 pt-1.5 w-72 z-50 animate-scale-in"
                  onMouseEnter={handleToolsMouseEnter}
                  onMouseLeave={handleToolsMouseLeave}
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-emerald-500/20 relative before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border-b border-surface-100 mb-1 flex items-center justify-between">
                      <span>{currentToolsConfig.title}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">{currentToolsConfig.badge}</span>
                    </div>
                    {smartToolsList.map(item => (
                      <Link
                        key={item.key}
                        to={item.path}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                          location.pathname === item.path
                            ? 'bg-emerald-50 text-brand-900 font-bold border border-emerald-200'
                            : 'hover:bg-surface-50 text-surface-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold leading-snug">{item.name}</span>
                            <span className="text-[9px] font-extrabold px-1 rounded bg-amber-100 text-amber-800">{item.tag}</span>
                          </div>
                          <div className="text-[10px] text-surface-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Remaining Role-Based Navigation Links */}
            {navLinks.slice(2).map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-800 via-emerald-700 to-emerald-600 text-white shadow-md shadow-brand-900/25 scale-[1.02]'
                      : 'text-surface-700 hover:text-brand-900 hover:bg-white/80'
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-200' : 'text-surface-400 group-hover:text-emerald-600'
                  }`}>
                    {getIconForLink(link.key)}
                  </span>
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Persona Deck */}
          <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 shrink-0 ml-auto">
            
            {/* Multi-Language Selector Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-100/90 border border-surface-200 text-[10px] font-bold shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="हिन्दी"
              >
                हि
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'gu'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="ગુજરાતી"
              >
                ગુ
              </button>
            </div>

            {user && (
              <div className="shrink-0">
                <NotificationBell />
              </div>
            )}

            {/* In-App Direct Messages */}
            {user && (
              <Link
                to={user.role === 'Expert' ? '/expert/messages' : '/chat'}
                className="p-1.5 text-surface-600 hover:text-brand-800 hover:bg-emerald-50/80 rounded-lg transition-all border border-transparent hover:border-emerald-200 relative group shrink-0"
                title={t('nav.messages', 'Messages')}
              >
                <FaComments className="text-base text-surface-600 group-hover:text-brand-700 transition-colors" />
                <span className="sr-only">Messages</span>
              </Link>
            )}

            {/* Buyer Cart */}
            {user?.role === 'Buyer' && (
              <Link 
                to="/cart" 
                className="relative p-1.5 text-surface-700 hover:text-brand-800 hover:bg-emerald-50/80 rounded-lg transition-all border border-transparent hover:border-emerald-200 group shrink-0"
                title={t('nav.cart', 'Shopping Cart')}
              >
                <FaShoppingCart className="text-base text-surface-700 group-hover:text-brand-700 group-hover:scale-110 transition-all" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-harvest-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated User Deck with High-Visibility Red Logout */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-surface-200/90 shrink-0">
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-1.5 pl-0.5 pr-2.5 py-0.5 rounded-full border bg-white/95 hover:bg-white hover:shadow-md transition-all group shrink-0 shadow-sm ${roleTheme.badgeClass}`}
                  title={t('nav.profile', 'View Profile')}
                >
                  <div className={`shrink-0 rounded-full ring-2 ${roleTheme.ringClass} p-0.5 flex items-center justify-center`}>
                    <Avatar src={user.profileImage} name={user.name} size="sm" className="w-8 h-8 shrink-0 rounded-full aspect-square" />
                  </div>
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-[11px] font-bold text-surface-800 max-w-[70px] lg:max-w-[90px] truncate leading-tight group-hover:text-brand-800">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] font-extrabold flex items-center gap-0.5 text-surface-500">
                      <span>{roleTheme.icon}</span> {roleTheme.label}
                    </span>
                  </div>
                </Link>
                
                {/* Prominent Red Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-red-200 transition-all shadow-sm shrink-0"
                  title={t('nav.logout', 'Sign Out')}
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center gap-2 shrink-0">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-xs font-bold text-surface-700 hover:text-brand-800 hover:bg-white/80 rounded-xl transition-all border border-transparent hover:border-surface-200 shrink-0"
                >
                  {t('nav.login', 'Log in')}
                </Link>
                <Link 
                  to="/register" 
                  className="btn-luxe-primary text-xs !py-1.5 !px-3.5 shadow-sm group shrink-0"
                >
                  <span>{t('nav.getStarted', 'Get Started')}</span>
                  <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Right Controls (Visible on phones & tablets < 1024px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden ml-auto shrink-0">
            {/* Tablet Quick Language Switcher */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-surface-100/90 border border-surface-200 text-[10px] font-bold shadow-inner shrink-0 mr-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="हिन्दी"
              >
                HI
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'gu'
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-700 text-white shadow-sm font-extrabold scale-105'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/60'
                }`}
                title="ગુજરાતી"
              >
                GU
              </button>
            </div>
            {user ? (
              <>
                {/* 1. Direct Logout Button on Mobile Header — 100% visible immediately */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 shadow-sm active:scale-95 transition-all shrink-0"
                  title={t('nav.logout', 'Logout')}
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>

                {/* 2. User Avatar */}
                <Link 
                  to="/profile" 
                  className={`shrink-0 rounded-full ring-2 ${roleTheme.ringClass} p-0.5`}
                  title={user.name}
                >
                  <Avatar src={user.profileImage} name={user.name} size="xs" className="w-7 h-7 rounded-full aspect-square" />
                </Link>

                {/* 3. Buyer Cart */}
                {user?.role === 'Buyer' && (
                  <Link to="/cart" className="relative p-1.5 text-surface-700 hover:text-brand-800 shrink-0">
                    <FaShoppingCart className="text-base" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-harvest-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* 4. Notification Bell */}
                <div className="shrink-0 scale-95">
                  <NotificationBell />
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-2.5 py-1 text-xs font-bold text-surface-800 bg-surface-100 hover:bg-surface-200 rounded-lg border border-surface-200 shrink-0"
              >
                {t('nav.login', 'Log in')}
              </Link>
            )}
            
            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-surface-700 hover:bg-surface-100 rounded-xl transition-colors border border-surface-200/80 shrink-0 ml-0.5"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <FaTimes size={18} className="text-red-600" /> : <FaBars size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-surface-200/80 max-h-[78vh] overflow-y-auto overscroll-contain pr-1 space-y-3 animate-fade-in custom-scrollbar">
            
            {/* 1. User Profile Card with PROMINENT RED LOGOUT BUTTON AT THE TOP */}
            {user && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-sm flex items-center justify-between gap-2">
                <Link 
                  to="/profile" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                  <div className={`shrink-0 rounded-full ring-2 ${roleTheme.ringClass} p-0.5`}>
                    <Avatar src={user.profileImage} name={user.name} size="sm" className="w-9 h-9 rounded-full aspect-square" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-surface-900 truncate">{user.name}</h4>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${roleTheme.badgeClass} shrink-0`}>
                        {roleTheme.icon} {roleTheme.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-surface-500 truncate">{user.email}</p>
                  </div>
                </Link>
                
                {/* PROMINENT LOGOUT BUTTON AT TOP OF DRAWER */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-red-600 bg-red-100 hover:bg-red-600 hover:text-white rounded-xl border border-red-300 transition-all shadow-sm shrink-0 active:scale-95"
                  title={t('nav.logout', 'Logout')}
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>
              </div>
            )}

            {/* 2. Mobile Language Switcher Strip */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-100/90 border border-surface-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-surface-700">
                <FaGlobe className="text-emerald-600 text-sm" />
                <span className="text-[11px]">Language / ભાષા / भाषा:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'en' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-surface-700'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'hi' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-surface-700'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('gu')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'gu' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-surface-700'
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>
            </div>

            {/* 3. Distinct AgriTech Innovation Tools Section (Role-Tailored) */}
            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <FaLeaf className="text-emerald-600 text-[10px]" />
                  {currentToolsConfig.title}
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {currentToolsConfig.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {smartToolsList.map((tool) => (
                  <Link
                    key={tool.key}
                    to={tool.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all border ${
                      location.pathname === tool.path
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-emerald-50/80 text-surface-800 border-surface-200/80'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      location.pathname === tool.path ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tool.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate leading-tight">{tool.name}</div>
                      <span className={`text-[8px] font-extrabold px-1 rounded inline-block mt-0.5 ${
                        location.pathname === tool.path ? 'bg-emerald-700 text-emerald-100' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tool.tag}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. Core Market & Navigation Links */}
            <div>
              <div className="px-1 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-surface-500">
                {t('nav.marketplace', 'Market & Trading')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {marketAndRoleLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      location.pathname === link.path
                        ? 'bg-brand-800 text-white border-brand-800 shadow-sm'
                        : 'bg-white hover:bg-surface-100 text-surface-800 border-surface-200/80'
                    }`}
                  >
                    <span className={location.pathname === link.path ? 'text-emerald-200' : 'text-surface-500'}>
                      {getIconForLink(link.key)}
                    </span>
                    <span className="flex-1">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 5. Direct Helpline Call Card */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <FaPhoneAlt className="text-amber-600 text-[11px]" />
                <span>{t('nav.kisanHelpline', 'Kisan Helpline')}</span>
              </div>
              <a 
                href="tel:18001801551" 
                className="font-extrabold text-brand-800 hover:underline text-xs bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-xs"
              >
                1800-180-1551
              </a>
            </div>

            {/* 6. Bottom Auth Actions */}
            <div className="pt-2 border-t border-surface-200/80">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>{t('nav.logout', 'Logout from Account')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-surface-800 bg-surface-100 hover:bg-surface-200 rounded-xl border border-surface-200"
                  >
                    <FaSignInAlt className="text-[11px]" /> {t('nav.login', 'Log in')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-700 to-emerald-600 rounded-xl shadow-sm"
                  >
                    {t('nav.getStarted', 'Get Started')} <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
