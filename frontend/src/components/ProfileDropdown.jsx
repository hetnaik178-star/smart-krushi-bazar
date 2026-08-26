import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import { FaUserCircle, FaChartLine, FaSignOutAlt, FaChevronDown, FaUserMd } from 'react-icons/fa';

const ProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'Admin') return '/admin/dashboard';
    if (user?.role === 'Farmer') return '/farmer/dashboard';
    if (user?.role === 'Expert') return '/expert/dashboard';
    return '/buyer/dashboard';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'Admin') return 'Admin Dashboard';
    if (user?.role === 'Farmer') return 'Farmer Dashboard';
    if (user?.role === 'Expert') return 'Expert Dashboard';
    return 'Buyer Dashboard';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100 transition-all duration-200 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <Avatar src={user?.profileImage} name={user?.name} size="sm" />
        <span className="hidden md:block text-xs font-bold text-brand-900 max-w-[120px] truncate">
          {user?.name ? user.name.split(' ')[0] : 'User'}
        </span>
        <FaChevronDown className={`text-xs text-brand-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-premium border border-surface-200 py-2 animate-[pageFade_0.2s_ease-out_forwards] z-50">
          <div className="px-4 py-3 border-b border-surface-100">
            <p className="text-sm font-bold text-surface-900 font-display truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 truncate font-medium">{user?.email}</p>
            <span className={`inline-block mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              user?.role === 'Farmer' 
                ? 'bg-emerald-100 text-emerald-800' 
                : user?.role === 'Admin'
                ? 'bg-purple-100 text-purple-800'
                : user?.role === 'Expert'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role}
            </span>
          </div>

          <nav className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-surface-700 hover:bg-emerald-50 hover:text-brand-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaUserCircle className="text-sm text-brand-600" />
              My Profile
            </Link>
            <Link
              to={getDashboardPath()}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-surface-700 hover:bg-emerald-50 hover:text-brand-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaChartLine className="text-sm text-brand-600" />
              {getDashboardLabel()}
            </Link>
          </nav>

          <div className="border-t border-surface-100 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="text-sm" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
