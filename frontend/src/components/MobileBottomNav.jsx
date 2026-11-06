import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from './Avatar';
import { 
  FaHome, FaStore, FaChartLine, FaTools, FaBoxes, FaTruck, 
  FaShoppingCart, FaUser, FaUserMd, FaLeaf, FaTimes, FaCalculator,
  FaLandmark, FaShieldAlt, FaMicroscope, FaSignOutAlt
} from 'react-icons/fa';

export default function MobileBottomNav() {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext) || { totalItems: 0 };
  const { t, language } = useLanguage();
  const location = useLocation();
  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);

  // Role-specific smart tools configuration for bottom sheet
  const getRoleTools = () => {
    if (user?.role === 'Buyer') {
      return [
        { 
          name: language === 'gu' ? 'નૂર અને ટ્રાન્સપોર્ટ' : language === 'hi' ? 'मालभाड़ा कैलकुलेटर' : 'Freight & Transport', 
          path: '/freight-calc', 
          icon: <FaTruck className="text-amber-600" />,
          tag: 'Doorstep'
        },
        { 
          name: language === 'gu' ? 'ગુણવત્તા અને પાસપોર્ટ' : language === 'hi' ? 'बैच व क्वालिटी चेक' : 'Crop Quality Check', 
          path: '/passport', 
          icon: <FaShieldAlt className="text-emerald-600" />,
          tag: 'Verified'
        },
        { 
          name: language === 'gu' ? 'જથ્થાબંધ માગણી' : language === 'hi' ? 'थोक मांग पोर्टल' : 'Bulk Crop Demand', 
          path: '/buyer/bulk-demand', 
          icon: <FaBoxes className="text-teal-600" />,
          tag: 'B2B 0%'
        },
        { 
          name: t('nav.mandiPrices', 'Mandi Prices'), 
          path: '/mandi', 
          icon: <FaChartLine className="text-blue-600" />,
          tag: 'APMC Live'
        }
      ];
    }

    if (user?.role === 'Admin') {
      return [
        { 
          name: language === 'gu' ? 'કંટ્રોલ પેનલ' : language === 'hi' ? 'एडमिन कंसोल' : 'Admin Console', 
          path: '/admin/dashboard', 
          icon: <FaShieldAlt className="text-purple-600" />,
          tag: 'System'
        },
        { 
          name: language === 'gu' ? 'વિવાદ નિવારણ' : language === 'hi' ? 'विवाद निवारण' : 'Trade Disputes', 
          path: '/admin/disputes', 
          icon: <FaLandmark className="text-amber-600" />,
          tag: 'Disputes'
        },
        { 
          name: t('nav.mandiPrices', 'Mandi Prices'), 
          path: '/mandi', 
          icon: <FaChartLine className="text-blue-600" />,
          tag: 'APMC Live'
        },
        { 
          name: language === 'gu' ? 'ડિજિટલ પાક પાસપોર્ટ' : language === 'hi' ? 'डिजिटल फसल पासपोर्ट' : 'Crop Passport', 
          path: '/passport', 
          icon: <FaBoxes className="text-emerald-600" />,
          tag: 'Verified'
        }
      ];
    }

    if (user?.role === 'Expert') {
      return [
        { 
          name: t('nav.aiCropDoctor', 'AI Crop Doctor'), 
          path: '/disease', 
          icon: <FaMicroscope className="text-cyan-600" />,
          tag: 'AI Vision'
        },
        { 
          name: t('nav.cropAdvisor', 'Crop Advisor'), 
          path: '/crop-advisor', 
          icon: <FaLeaf className="text-emerald-600" />,
          tag: 'Soil AI'
        },
        { 
          name: t('nav.govtSchemes', 'Govt Schemes'), 
          path: '/schemes', 
          icon: <FaLandmark className="text-purple-600" />,
          tag: 'Subsidies'
        }
      ];
    }

    // Farmer & Guest default tools
    return [
      { 
        name: t('nav.cropAdvisor', 'Crop Advisor'), 
        path: '/crop-advisor', 
        icon: <FaLeaf className="text-emerald-600" />,
        tag: 'Soil AI'
      },
      { 
        name: t('nav.aiCropDoctor', 'AI Crop Doctor'), 
        path: '/disease', 
        icon: <FaMicroscope className="text-emerald-600" />,
        tag: '24/7 AI'
      },
      { 
        name: t('nav.fertilizerCalc', 'Fertilizer Calc'), 
        path: '/fertilizer-calc', 
        icon: <FaCalculator className="text-emerald-600" />,
        tag: 'Dosage'
      },
      { 
        name: t('nav.govtSchemes', 'Govt Schemes'), 
        path: '/schemes', 
        icon: <FaLandmark className="text-emerald-600" />,
        tag: 'Subsidies'
      },
      { 
        name: language === 'gu' ? 'નૂર અને ટ્રાન્સપોર્ટ' : language === 'hi' ? 'मालभाड़ा कैलकुलेटर' : 'Freight & Transport', 
        path: '/freight-calc', 
        icon: <FaTruck className="text-emerald-600" />,
        tag: 'Transport'
      },
      { 
        name: language === 'gu' ? 'ડિજિટલ પાક પાસપોર્ટ' : language === 'hi' ? 'डिजिटल फसल पासपोर्ट' : 'Crop Passport', 
        path: '/passport', 
        icon: <FaShieldAlt className="text-emerald-600" />,
        tag: 'QR Trace'
      }
    ];
  };

  const roleTools = getRoleTools();
  const isToolsActive = roleTools.some(tool => location.pathname === tool.path);

  // Tabs tailored to user persona
  const getNavTabs = () => {
    if (user?.role === 'Buyer') {
      return [
        {
          key: 'home',
          label: t('nav.home', 'Home'),
          path: '/',
          icon: <FaHome className="text-lg" />,
          isActive: location.pathname === '/'
        },
        {
          key: 'market',
          label: t('nav.marketplace', 'Market'),
          path: '/products',
          icon: <FaStore className="text-lg" />,
          isActive: location.pathname === '/products' || location.pathname.startsWith('/products/')
        },
        {
          key: 'tools',
          label: t('nav.smartTools', 'Tools'),
          isAction: true,
          action: () => setToolsSheetOpen(true),
          icon: <FaTools className="text-lg" />,
          isActive: isToolsActive || toolsSheetOpen,
          badge: `${roleTools.length}`
        },
        {
          key: 'cart',
          label: t('nav.cart', 'Cart'),
          path: '/cart',
          icon: <FaShoppingCart className="text-lg" />,
          isActive: location.pathname === '/cart',
          badgeCount: totalItems
        },
        {
          key: 'account',
          label: t('nav.dashboard', 'Profile'),
          path: '/buyer/dashboard',
          icon: user.profileImage ? (
            <Avatar src={user.profileImage} name={user.name} size="xs" className="w-5 h-5 rounded-full" />
          ) : (
            <FaUser className="text-lg" />
          ),
          isActive: location.pathname.startsWith('/buyer') || location.pathname === '/profile'
        }
      ];
    }

    if (user?.role === 'Farmer') {
      return [
        {
          key: 'home',
          label: t('nav.home', 'Home'),
          path: '/',
          icon: <FaHome className="text-lg" />,
          isActive: location.pathname === '/'
        },
        {
          key: 'market',
          label: t('nav.marketplace', 'Market'),
          path: '/products',
          icon: <FaStore className="text-lg" />,
          isActive: location.pathname === '/products' || location.pathname.startsWith('/products/')
        },
        {
          key: 'tools',
          label: t('nav.smartTools', 'Tools'),
          isAction: true,
          action: () => setToolsSheetOpen(true),
          icon: <FaTools className="text-lg" />,
          isActive: isToolsActive || toolsSheetOpen,
          badge: '6'
        },
        {
          key: 'orders',
          label: language === 'gu' ? 'ઓર્ડર્સ' : language === 'hi' ? 'ऑर्डर्स' : 'Orders',
          path: '/farmer/orders',
          icon: <FaTruck className="text-lg" />,
          isActive: location.pathname === '/farmer/orders'
        },
        {
          key: 'account',
          label: t('nav.dashboard', 'Kisan'),
          path: '/farmer/dashboard',
          icon: user.profileImage ? (
            <Avatar src={user.profileImage} name={user.name} size="xs" className="w-5 h-5 rounded-full" />
          ) : (
            <FaUser className="text-lg" />
          ),
          isActive: location.pathname.startsWith('/farmer') && location.pathname !== '/farmer/orders'
        }
      ];
    }

    if (user?.role === 'Expert') {
      return [
        {
          key: 'home',
          label: t('nav.home', 'Home'),
          path: '/',
          icon: <FaHome className="text-lg" />,
          isActive: location.pathname === '/'
        },
        {
          key: 'consult',
          label: t('nav.consultations', 'Consult'),
          path: '/expert/consultations',
          icon: <FaUserMd className="text-lg" />,
          isActive: location.pathname === '/expert/consultations'
        },
        {
          key: 'tools',
          label: t('nav.smartTools', 'Tools'),
          isAction: true,
          action: () => setToolsSheetOpen(true),
          icon: <FaTools className="text-lg" />,
          isActive: isToolsActive || toolsSheetOpen,
          badge: '3'
        },
        {
          key: 'disease',
          label: 'AI Doctor',
          path: '/disease',
          icon: <FaMicroscope className="text-lg" />,
          isActive: location.pathname === '/disease'
        },
        {
          key: 'account',
          label: t('nav.dashboard', 'Doctor'),
          path: '/expert/dashboard',
          icon: user.profileImage ? (
            <Avatar src={user.profileImage} name={user.name} size="xs" className="w-5 h-5 rounded-full" />
          ) : (
            <FaUser className="text-lg" />
          ),
          isActive: location.pathname.startsWith('/expert') && location.pathname !== '/expert/consultations'
        }
      ];
    }

    if (user?.role === 'Admin') {
      return [
        {
          key: 'home',
          label: t('nav.home', 'Home'),
          path: '/',
          icon: <FaHome className="text-lg" />,
          isActive: location.pathname === '/'
        },
        {
          key: 'market',
          label: t('nav.marketplace', 'Market'),
          path: '/products',
          icon: <FaStore className="text-lg" />,
          isActive: location.pathname === '/products' || location.pathname.startsWith('/products/')
        },
        {
          key: 'tools',
          label: language === 'gu' ? 'ટૂલ્સ' : language === 'hi' ? 'टूल्स' : 'Tools',
          isAction: true,
          action: () => setToolsSheetOpen(true),
          icon: <FaTools className="text-lg" />,
          isActive: isToolsActive || toolsSheetOpen,
          badge: `${roleTools.length}`
        },
        {
          key: 'disputes',
          label: language === 'gu' ? 'વિવાદ' : language === 'hi' ? 'विवाद' : 'Disputes',
          path: '/admin/disputes',
          icon: <FaShieldAlt className="text-lg" />,
          isActive: location.pathname === '/admin/disputes'
        },
        {
          key: 'admin',
          label: language === 'gu' ? 'એડમિન' : language === 'hi' ? 'एडमिन' : 'Console',
          path: '/admin/dashboard',
          icon: user?.profileImage ? (
            <Avatar src={user.profileImage} name={user.name} size="xs" className="w-5 h-5 rounded-full" />
          ) : (
            <FaUser className="text-lg" />
          ),
          isActive: location.pathname.startsWith('/admin') && location.pathname !== '/admin/disputes'
        }
      ];
    }

    // Guest / Public Visitor
    return [
      {
        key: 'home',
        label: t('nav.home', 'Home'),
        path: '/',
        icon: <FaHome className="text-lg" />,
        isActive: location.pathname === '/'
      },
      {
        key: 'market',
        label: t('nav.marketplace', 'Market'),
        path: '/products',
        icon: <FaStore className="text-lg" />,
        isActive: location.pathname === '/products' || location.pathname.startsWith('/products/')
      },
      {
        key: 'tools',
        label: t('nav.smartTools', 'Tools'),
        isAction: true,
        action: () => setToolsSheetOpen(true),
        icon: <FaTools className="text-lg" />,
        isActive: isToolsActive || toolsSheetOpen,
        badge: '6'
      },
      {
        key: 'mandi',
        label: t('nav.mandiPrices', 'Mandi'),
        path: '/mandi',
        icon: <FaChartLine className="text-lg" />,
        isActive: location.pathname === '/mandi'
      },
      {
        key: 'login',
        label: t('nav.login', 'Login'),
        path: '/login',
        icon: <FaUser className="text-lg" />,
        isActive: location.pathname === '/login' || location.pathname === '/register'
      }
    ];
  };

  const navTabs = getNavTabs();

  return (
    <>
      {/* ── Fixed Native Mobile Bottom Navigation Bar (Visible < lg screens) ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-2xl border-t border-emerald-500/25 shadow-[0_-4px_25px_rgba(6,78,59,0.12)] safe-area-pb">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {navTabs.map(tab => {
            const content = (
              <div className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 select-none ${
                tab.isActive ? 'text-brand-900 font-extrabold scale-105' : 'text-surface-500 hover:text-surface-800'
              }`}>
                {/* Active Indicator Top Glow Pill */}
                {tab.isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                )}

                {/* Icon with optional badges */}
                <div className="relative mb-0.5">
                  <div className={`p-1 rounded-xl transition-all ${
                    tab.isActive 
                      ? 'bg-gradient-to-tr from-emerald-100 to-teal-50 text-brand-800 shadow-sm' 
                      : 'text-surface-500'
                  }`}>
                    {tab.icon}
                  </div>

                  {/* Cart count badge */}
                  {tab.badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-harvest-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                      {tab.badgeCount}
                    </span>
                  )}

                  {/* Tools count micro tag */}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-black px-1 rounded-full shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] tracking-tight leading-none ${
                  tab.isActive ? 'text-brand-900 font-black' : 'font-semibold text-surface-500'
                }`}>
                  {tab.label}
                </span>
              </div>
            );

            if (tab.isAction) {
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={tab.action}
                  className="flex-1 focus:outline-none"
                  aria-label={tab.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                to={tab.path}
                className="flex-1 focus:outline-none"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Quick Smart Tools Bottom Sheet (Modal on Mobile) ── */}
      {toolsSheetOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in p-0"
          onClick={() => setToolsSheetOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-t-3xl p-5 shadow-2xl border-t border-emerald-500/30 animate-slide-up pb-8 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-surface-300 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shadow-sm">
                  <FaTools />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-surface-900 font-display">
                    {user?.role === 'Buyer' ? 'Buyer Procurement Tools' : user?.role === 'Expert' ? 'Agronomy Advisory Tools' : user?.role === 'Admin' ? 'Admin Governance Tools' : 'AgriTech Innovation Tools'}
                  </h3>
                  <p className="text-[10px] text-surface-500 font-medium">
                    {roleTools.length} {language === 'gu' ? 'ટૂલ્સ ઉપલબ્ધ' : language === 'hi' ? 'टूल्स उपलब्ध' : 'Tools Available'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setToolsSheetOpen(false)}
                className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Role Tools Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {roleTools.map(tool => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setToolsSheetOpen(false)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                    location.pathname === tool.path
                      ? 'bg-emerald-50 border-emerald-300 text-brand-900 shadow-sm'
                      : 'bg-surface-50/70 hover:bg-emerald-50/50 border-surface-200 text-surface-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm">
                      {tool.icon}
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {tool.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-surface-900 line-clamp-1">{tool.name}</h4>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Profile / Direct Logout in Sheet */}
            {user && (
              <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={user.profileImage} name={user.name} size="xs" className="w-7 h-7 rounded-full" />
                  <span className="text-xs font-bold text-surface-800 truncate max-w-[150px]">{user.name}</span>
                </div>
                <button
                  onClick={() => { logout(); setToolsSheetOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                >
                  <FaSignOutAlt className="text-[11px]" />
                  <span>{t('nav.logout', 'Logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
