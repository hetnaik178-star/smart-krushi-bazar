import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';
import { FaBars, FaTimes, FaShoppingCart, FaSeedling, FaComments, FaTractor, FaUserMd } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext) || { totalItems: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  // Strict Role-Based Navigation
  const getNavLinks = () => {
    const base = [
      { name: 'Marketplace', path: '/products' },
      { name: 'Mandi Prices', path: '/mandi' },
    ];
    if (!user) return [...base, { name: 'Find Experts', path: '/experts' }];
    if (user.role === 'Farmer') return [...base, { name: 'Find Experts', path: '/experts' }, { name: 'AI Crop Doctor', path: '/disease' }, { name: 'Dashboard', path: '/farmer/dashboard' }];
    if (user.role === 'Buyer') return [...base, { name: 'Find Experts', path: '/experts' }, { name: 'Dashboard', path: '/buyer/dashboard' }];
    if (user.role === 'Expert') return [...base, { name: 'Dashboard', path: '/expert/dashboard' }, { name: 'Consultations', path: '/expert/consultations' }];
    if (user.role === 'Admin') return [{ name: 'Admin Panel', path: '/admin/dashboard' }];
    return base;
  };

  const navLinks = getNavLinks();

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-premium border-b border-emerald-100/80 py-2.5' : 'bg-white/80 backdrop-blur-md border-b border-surface-200/80 py-3.5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-800 via-brand-700 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <FaSeedling className="text-base text-emerald-100 animate-pulse-slow" />
            </div>
            <span className="font-display font-extrabold text-xl sm:text-2xl text-surface-900 tracking-tight">
              Smart<span className="bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text text-transparent">Krushi</span><span className="text-harvest-500 text-xs uppercase ml-1 px-1.5 py-0.5 rounded-md bg-harvest-50 font-bold border border-harvest-200">Bazar</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-100/70 p-1 rounded-2xl border border-surface-200/60 backdrop-blur-sm">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-brand-800 shadow-sm shadow-brand-900/5'
                      : 'text-surface-600 hover:text-brand-800 hover:bg-white/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions Header */}
          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationBell />}

            {user && (
              <Link
                to={user.role === 'Expert' ? '/expert/messages' : '/chat'}
                className="p-2 text-surface-600 hover:text-brand-700 hover:bg-emerald-50/80 rounded-xl transition-all border border-transparent hover:border-emerald-200/60"
                title="Messages"
              >
                <FaComments className="text-lg" />
              </Link>
            )}

            {user?.role === 'Buyer' && (
              <Link to="/cart" className="relative p-2 text-surface-600 hover:text-brand-700 hover:bg-emerald-50/80 rounded-xl transition-all border border-transparent hover:border-emerald-200/60">
                <FaShoppingCart className="text-lg" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-harvest-500 to-amber-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-surface-200">
                <Link to="/profile" className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-surface-200/80 bg-surface-50/80 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
                  <Avatar src={user.profileImage} name={user.name} size="xs" />
                  <span className="text-xs font-bold text-surface-800 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-surface-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="px-3.5 py-2 text-xs font-bold text-surface-700 hover:text-brand-700 transition-colors">Log in</Link>
                <Link to="/register" className="btn-saas-primary text-xs !py-2 !px-4 shadow-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}

            {user?.role === 'Buyer' && (
              <Link to="/cart" className="relative p-2 text-surface-600">
                <FaShoppingCart className="text-lg" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-harvest-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-surface-600 hover:bg-surface-100 rounded-xl"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-200 shadow-xl animate-fade-in">
          <div className="px-4 py-4 space-y-1.5">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-800 border border-brand-200/60'
                    : 'text-surface-700 hover:bg-surface-100'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                to={user.role === 'Expert' ? '/expert/messages' : '/chat'}
                onClick={() => setMobileOpen(false)}
                className="block px-3.5 py-2.5 text-xs font-bold text-surface-700 hover:bg-surface-100 rounded-xl"
              >
                Messages
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-3.5 py-2.5 text-xs font-bold text-surface-700 hover:bg-surface-100 rounded-xl"
              >
                My Profile
              </Link>
            )}

            {!user ? (
              <div className="pt-3 border-t border-surface-100 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center btn-saas-secondary text-xs !py-2.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center btn-saas-primary text-xs !py-2.5"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-surface-100">
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
