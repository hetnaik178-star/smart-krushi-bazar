import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  FaSeedling, FaHeart, FaShieldAlt, FaTractor, FaPhoneAlt, FaEnvelope,
  FaMapMarkerAlt, FaWhatsapp, FaYoutube, FaTelegramPlane, FaCheckCircle,
  FaPaperPlane, FaLock, FaGlobeAmericas, FaAward, FaCloudSun, FaArrowRight
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useLanguage();
  const [contactInput, setContactInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setContactInput('');
    }, 4000);
  };

  return (
    <footer className="bg-gradient-to-b from-[#021d15] via-[#01140e] to-[#000a07] text-white pt-10 sm:pt-14 pb-24 lg:pb-8 border-t border-emerald-500/25 mt-auto relative overflow-hidden">

      {/* ── Atmospheric Ambient Glowing Orbs ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      {/* ── Agricultural Top Skyline Mesh ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top VIP Smart-Advisory & Mandi Alerts Glass Box ── */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl footer-dark-glass relative overflow-hidden border border-emerald-400/25">
          {/* Subtle light shimmer line */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('footer.mandiAlertsTitle', 'Daily APMC Mandi Intelligence & Weather Alerts')}</span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                {t('footer.mandiAlertsTitle', 'Stay Ahead of Market Price Fluctuations')}
              </h3>
              <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-xl">
                {t('footer.mandiAlertsDesc', 'Receive live APMC wholesale price forecasts, local weather warnings, and direct crop doctor advisories straight to your phone.')}
              </p>
            </div>

            {/* Right Interactive Form */}
            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-3 animate-scale-in">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <FaCheckCircle className="text-base" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-sm">{t('common.success', 'Subscription Confirmed!')}</h5>
                    <p className="text-[11px] text-emerald-200/90 font-normal">{t('footer.subscribedMsg', 'You will receive daily morning Mandi alerts & weather advisories.')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                      placeholder={t('footer.subscribePlaceholder', 'WhatsApp number or Email...')}
                      className="w-full px-4 py-3 rounded-xl bg-emerald-950/70 border border-emerald-400/30 text-white placeholder-emerald-300/40 text-xs focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-luxe-primary text-xs !py-3 !px-5 whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
                  >
                    <span>{t('footer.subscribeBtn', 'Join Free')}</span>
                    <FaPaperPlane className="text-[10px]" />
                  </button>
                </form>
              )}
              <p className="text-[10px] text-emerald-300/50 mt-2 flex items-center gap-1.5">
                <FaLock className="text-[9px]" /> 100% Free & Spam-Free. Direct Ministry / APMC Data.
              </p>
            </div>
          </div>
        </div>

        {/* ── Platform Live Telemetry & Trust Badges Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/30 transition-all flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FaGlobeAmericas className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">AGMARKNET</span>
              </div>
              <span className="text-[10px] text-emerald-300/70 block">{t('footer.liveTelemetry', 'Direct APMC live feed')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <FaTractor className="text-base" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{t('nav.middlemanGuarantee', '0% Middleman Cut')}</span>
              <span className="text-[10px] text-amber-300/70 block">{t('footer.zeroMiddleman', '100% Direct farmer payout')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 transition-all flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <FaAward className="text-base" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{t('nav.aiCropDoctor', 'AI Crop Doctor')}</span>
              <span className="text-[10px] text-cyan-300/70 block">{t('footer.cropDoctorBadge', '98.4% diagnostic accuracy')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/30 transition-all flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Escrow Protected</span>
              <span className="text-[10px] text-emerald-300/70 block">{t('footer.escrowBadge', '256-bit bank encrypted')}</span>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">

          {/* Col 1: Brand Info & Community */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-700 via-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform border border-emerald-300/40">
                <FaSeedling className="text-lg text-emerald-100 leaf-gleam" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tight text-white leading-none">
                  Smart<span className="text-emerald-400">Krushi</span>
                  <span className="text-harvest-400 text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-harvest-950 font-bold border border-harvest-700">
                    Bazar
                  </span>
                </span>
                <span className="text-[9px] font-bold text-emerald-300/60 tracking-wider uppercase mt-0.5">
                  {t('nav.directEcosystem', 'Agritech Empowerment Platform')}
                </span>
              </div>
            </Link>

            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t('footer.tagline', 'Connecting Indian farmers directly with wholesale and retail buyers. Enabling real-time APMC Mandi price discovery, AI plant pathology, and agronomy specialists.')}
            </p>

            {/* Social & Community Channels */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-emerald-300/60 tracking-wider block mb-2">
                Join Community & Updates
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 flex items-center justify-center text-emerald-300 hover:text-white transition-all shadow-sm group"
                  title="WhatsApp Kisan Mitra Community"
                >
                  <FaWhatsapp className="text-sm group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 flex items-center justify-center text-red-300 hover:text-white transition-all shadow-sm group"
                  title="YouTube Agri Tutorials"
                >
                  <FaYoutube className="text-sm group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-blue-500 border border-white/10 hover:border-blue-400 flex items-center justify-center text-blue-300 hover:text-white transition-all shadow-sm group"
                  title="Telegram Mandi Alerts"
                >
                  <FaTelegramPlane className="text-sm group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Marketplace Intelligence */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display flex items-center gap-1.5">
              <span>🌾</span> {t('footer.colMarket', 'Marketplace')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
              <li>
                <Link to="/products" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('marketplace.title', 'Fresh Harvest Catalog')}
                </Link>
              </li>
              <li>
                <Link to="/mandi" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('nav.mandiPrices', 'Live Mandi Prices')}
                </Link>
              </li>
              <li>
                <Link to="/disease" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('nav.aiCropDoctor', 'AI Crop Doctor')}
                </Link>
              </li>
              <li>
                <Link to="/experts" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('nav.findExperts', 'Certified Agronomists')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portals & Governance */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display flex items-center gap-1.5">
              <span>🏛️</span> {t('footer.colPortals', 'Portals')}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
              <li>
                <Link to="/register" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('home.registerFarmer', 'Farmer Registration')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('roles.buyer', 'Buyer')} {t('common.verified', 'Onboarding')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('roles.expert', 'Specialist')} {t('nav.login', 'Login')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="inline-flex items-center gap-1 hover:text-emerald-300 transition-all hover:translate-x-1">
                  <FaArrowRight className="text-[9px] text-emerald-500/60" /> {t('roles.admin', 'Admin')} {t('nav.login', 'Command')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: 24/7 Kisan Helpline & Support */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-xs text-harvest-400 uppercase tracking-wider mb-4 font-display flex items-center gap-1.5">
              <span>📞</span> {t('footer.colSupport', '24/7 Kisan Helpline')}
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-3 text-xs">
              {/* Audio Wave Indicator */}
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 h-4">
                    <span className="w-1 bg-emerald-400 rounded-full audio-bar-1" />
                    <span className="w-1 bg-emerald-400 rounded-full audio-bar-2" />
                    <span className="w-1 bg-emerald-400 rounded-full audio-bar-3" />
                    <span className="w-1 bg-emerald-400 rounded-full audio-bar-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-200">{t('footer.helplineActive', 'National Call Center Active')}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
                  {t('footer.tollFree', 'Toll Free')}
                </span>
              </div>

              <a
                href="tel:18001801551"
                className="flex items-center gap-2.5 text-white hover:text-emerald-300 font-extrabold text-sm transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-harvest-500/20 text-harvest-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FaPhoneAlt className="text-xs" />
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-300/70 font-normal">{t('nav.kisanHelpline', 'Kisan Helpline')}:</span>
                  <span>1800-180-1551</span>
                </div>
              </a>

              <a
                href="mailto:support@smartkrushibazar.in"
                className="flex items-center gap-2.5 text-emerald-200 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FaEnvelope className="text-xs" />
                </div>
                <span className="text-[11px]">support@smartkrushibazar.in</span>
              </a>

              <div className="flex items-start gap-2.5 text-emerald-200/80 pt-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="text-xs" />
                </div>
                <span className="text-[11px] leading-tight">
                  Anand Agricultural Zone, Gujarat, Bharat
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-Footer Divider & Copyright ── */}
        <div className="pt-8 border-t border-emerald-500/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-emerald-200/60 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full tricolor-glow" />
            <p>© 2026 Smart Krushi Bazar. Digital Agricultural Empowerment Platform.</p>
          </div>

          <div className="flex items-center gap-2 font-semibold text-emerald-100">
            <span>{t('footer.madeWith', 'Made with')}</span>
            <FaHeart className="text-red-500 animate-pulse text-xs" />
            <span>{t('footer.forFarmers', "for Bharat's Farmers & Buyers")}</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-emerald-300/60">
            <Link to="/products" className="hover:text-emerald-300 transition-colors">{t('footer.fairTrade', 'Fair Trade Policy')}</Link>
            <span>•</span>
            <Link to="/mandi" className="hover:text-emerald-300 transition-colors">{t('footer.apmcCompliance', 'APMC Compliance')}</Link>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{t('footer.isoCertified', 'ISO 27001 Certified')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
