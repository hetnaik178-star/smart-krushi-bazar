import { Link } from 'react-router-dom';
import { FaSeedling, FaHeart, FaShieldAlt, FaTractor, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-gradient-to-b from-brand-950 via-[#032018] to-[#01140f] text-white pt-16 pb-8 border-t border-brand-900/60 mt-auto relative overflow-hidden">
    {/* Decorative subtle ambient lights */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-harvest-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="md:col-span-5 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-700 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <FaSeedling className="text-base text-emerald-100" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              Smart<span className="text-emerald-400">Krushi</span><span className="text-harvest-400 text-xs uppercase ml-1 px-1.5 py-0.5 rounded-md bg-harvest-950 font-bold border border-harvest-700">Bazar</span>
            </span>
          </Link>
          <p className="text-brand-200/80 text-xs sm:text-sm leading-relaxed max-w-sm">
            India's dedicated AgriTech platform connecting farmers directly with wholesale and retail buyers. Access real-time Mandi rates, AI disease scanning, and agronomy specialists.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-harvest-300 font-bold uppercase tracking-wider pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1">
              🌱 0% Commission
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1">
              🌾 Verified Produce
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1">
              🔒 SSL Secure Trade
            </span>
          </div>
        </div>

        {/* Col 2: Platform Links */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display">Marketplace</h4>
          <ul className="space-y-2.5 text-xs text-brand-200/80 font-medium">
            <li><Link to="/products" className="hover:text-emerald-300 transition-colors">Browse Fresh Produce</Link></li>
            <li><Link to="/mandi" className="hover:text-emerald-300 transition-colors">Live Mandi Prices</Link></li>
            <li><Link to="/experts" className="hover:text-emerald-300 transition-colors">Agronomy Specialists</Link></li>
            <li><Link to="/disease" className="hover:text-emerald-300 transition-colors">AI Crop Doctor</Link></li>
          </ul>
        </div>

        {/* Col 3: Portal Links */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display">Portals</h4>
          <ul className="space-y-2.5 text-xs text-brand-200/80 font-medium">
            <li><Link to="/register" className="hover:text-emerald-300 transition-colors">Farmer Registration</Link></li>
            <li><Link to="/register" className="hover:text-emerald-300 transition-colors">Buyer Onboarding</Link></li>
            <li><Link to="/login" className="hover:text-emerald-300 transition-colors">Specialist Login</Link></li>
            <li><Link to="/login" className="hover:text-emerald-300 transition-colors">Admin Dashboard</Link></li>
          </ul>
        </div>

        {/* Col 4: Trust & Support */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display">Agricultural Helpline</h4>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-brand-200/80">
            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-harvest-400 shrink-0" />
              <span>Kisan Support: 1800-180-1551</span>
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-harvest-400 shrink-0" />
              <span>support@smartkrushibazar.in</span>
            </p>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-harvest-400 shrink-0" />
              <span>Anand Agricultural Zone, Gujarat</span>
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-brand-900/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-brand-300/70 gap-4">
        <p>© 2026 Smart Krushi Bazar. Digital Agricultural Empowerment Platform.</p>
        <p className="flex items-center gap-1.5 font-medium">
          Crafted with <FaHeart className="text-red-500" /> for Indian Farmers
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
