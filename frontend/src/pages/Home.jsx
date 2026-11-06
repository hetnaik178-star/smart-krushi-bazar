import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FaArrowRight, FaChartLine, FaShieldAlt, FaTractor, FaLeaf, FaHandshake, FaSeedling, FaRupeeSign, FaBolt, FaUserCheck, FaMicroscope, FaStar, FaCalculator, FaLandmark, FaTruck, FaQrcode } from 'react-icons/fa';
import MiddlemanProfitCalculator from '../components/MiddlemanProfitCalculator';

const AnimatedCounter = ({ target, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, isVisible]);

  return <span ref={counterRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-transparent page-fade-in overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-950 via-brand-900 to-brand-950 text-white pt-10 pb-16 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating Decorative Elements (Visible on tablet & desktop) */}
        <FaLeaf className="hidden sm:block absolute top-20 left-[10%] text-emerald-400/30 text-4xl animate-float pointer-events-none" />
        <FaSeedling className="hidden sm:block absolute top-40 right-[15%] text-harvest-400/30 text-5xl animate-float-slow animate-orbit pointer-events-none" />
        <FaLeaf className="hidden sm:block absolute bottom-24 left-[20%] text-emerald-300/20 text-3xl animate-float-delayed pointer-events-none" />
        
        {/* Particle Dot Grid */}
        <div className="hidden sm:block absolute top-1/3 left-1/4 w-2 h-2 bg-white/40 rounded-full particle-dot animate-pulse-slow"></div>
        <div className="hidden sm:block absolute top-1/2 right-1/3 w-3 h-3 bg-white/30 rounded-full particle-dot animate-float-slow"></div>
        <div className="hidden sm:block absolute bottom-1/3 right-1/4 w-2 h-2 bg-harvest-400/40 rounded-full particle-dot animate-float-delayed"></div>
        <div className="hidden sm:block absolute top-1/4 right-10 w-1.5 h-1.5 bg-emerald-400/50 rounded-full particle-dot animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Top Floating Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md text-harvest-300 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold mb-4 sm:mb-8 border border-white/15 shadow-glow-harvest animate-float">
              <FaLeaf className="text-emerald-400 text-xs" /> {t('home.heroTag', "India's Direct AgriTech Marketplace & Consultation")}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight font-display leading-[1.15]">
              {t('home.heroTitle1', 'Direct Farm Trade')} <br />
              <span className="bg-gradient-to-r from-emerald-300 via-harvest-300 to-amber-400 bg-clip-text text-transparent gradient-text">
                {t('home.heroTitle2', 'Powered by Smart Agriculture')}
              </span>
            </h1>

            <p className="mt-3 sm:mt-6 text-xs sm:text-base lg:text-xl leading-relaxed text-brand-100/90 max-w-2xl mx-auto font-medium">
              {t('home.heroDesc', 'Eliminate middlemen commission. Access live APMC Mandi prices, 24/7 AI crop disease diagnostics, and 1-on-1 certified agronomy specialist advisories.')}
            </p>

            {/* CTAs */}
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link to="/products" className="btn-luxe-harvest text-xs sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl group w-full sm:w-auto text-center justify-center">
                {t('home.exploreMarket', 'Explore Fresh Harvest')} <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn-saas-secondary text-xs sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md w-full sm:w-auto text-center justify-center">
                {t('home.registerFarmer', 'Register as Farmer')}
              </Link>
            </div>

            {/* Live Trust Badges Pill Bar */}
            <div className="mt-8 sm:mt-14 pt-4 sm:pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-3 sm:gap-8 text-[10px] sm:text-xs text-brand-200/90 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><FaShieldAlt className="text-emerald-400 text-xs" /> {t('home.trustZeroMiddlemen', '0% Middleman Loss')}</span>
              <span className="flex items-center gap-1.5"><FaBolt className="text-harvest-400 text-xs" /> {t('home.trustInstantPayment', 'Instant Razorpay & COD')}</span>
              <span className="flex items-center gap-1.5"><FaUserCheck className="text-emerald-400 text-xs" /> {t('home.trustAgronomists', 'Certified Agronomists')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS & IMPACT SECTION */}
      <section className="py-6 sm:py-12 bg-white/85 backdrop-blur-2xl border border-emerald-400/20 shadow-[0_20px_50px_rgba(6,78,59,0.12)] -mt-6 sm:-mt-8 relative z-20 max-w-6xl mx-3 sm:mx-auto px-3 sm:px-6 rounded-2xl sm:rounded-t-[3rem]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6 text-center">
          {[
            { target: 10000, prefix: '', suffix: '+', label: t('home.statFarmers', 'Registered Farmers'), icon: FaTractor, color: 'text-brand-700', stagger: 'stagger-1' },
            { target: 12, prefix: '₹', suffix: 'Cr+', label: t('home.statTrade', 'Direct Trade Value'), icon: FaRupeeSign, color: 'text-harvest-600', stagger: 'stagger-2' },
            { target: 500, prefix: '', suffix: '+', label: t('home.statAccuracy', 'Verified Specialists'), icon: FaMicroscope, color: 'text-brand-700', stagger: 'stagger-3' },
            { target: 24, prefix: '', suffix: '/7', label: t('nav.aiCropDoctor', 'AI Crop Diagnostic'), icon: FaSeedling, color: 'text-emerald-600', stagger: 'stagger-4' },
          ].map((s, i) => (
            <div key={i} className={`card-saas p-3.5 sm:p-7 flex flex-col items-center justify-center hover:border-brand-300 animate-slide-up ${s.stagger}`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-brand-700 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:animate-bounce-gentle">
                <s.icon className="text-sm sm:text-lg" />
              </div>
              <p className="text-lg sm:text-3xl font-black text-surface-900 font-display">
                <AnimatedCounter target={s.target} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-surface-500 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY'S TOP MANDI RATES TICKER */}
      <section className="bg-emerald-950 py-3 overflow-hidden relative border-y border-brand-800">
        <div className="flex whitespace-nowrap" style={{ animation: 'slide-left-infinite 20s linear infinite' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8 px-4 items-center shrink-0">
              <span className="text-harvest-400 font-bold text-sm">Wheat ₹2,450/Qtl</span>
              <span className="text-emerald-500">•</span>
              <span className="text-harvest-400 font-bold text-sm">Tomato ₹1,800/Qtl</span>
              <span className="text-emerald-500">•</span>
              <span className="text-harvest-400 font-bold text-sm">Onion ₹2,100/Qtl</span>
              <span className="text-emerald-500">•</span>
              <span className="text-harvest-400 font-bold text-sm">Potato ₹1,200/Qtl</span>
              <span className="text-emerald-500">•</span>
              <span className="text-harvest-400 font-bold text-sm">Cotton ₹7,200/Qtl</span>
              <span className="text-emerald-500">•</span>
              <span className="text-harvest-400 font-bold text-sm">Mustard ₹5,400/Qtl</span>
              <span className="text-emerald-500">•</span>
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slide-left-infinite {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}} />
      </section>

      {/* 3 CORE PILLARS OF SMART KRUSHI BAZAR */}
      <section className="py-10 sm:py-20 lg:py-28 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-16">
            <span className="text-[11px] sm:text-xs font-extrabold text-brand-800 uppercase tracking-widest bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300 shadow-sm backdrop-blur-sm">
              {t('home.pillarsTitle', 'Complete Agricultural Ecosystem')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-surface-900 font-display mt-3 sm:mt-4">
              {t('home.pillarsSubtitle', 'Everything A Modern Farmer Needs')}
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-surface-600 font-medium">
              {t('home.heroDesc', 'Integrated digital tools engineered to maximize crop yield, reduce logistics overhead, and ensure fair prices.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: FaTractor,
                title: t('home.pillar1Title', 'Direct Trade Marketplace'),
                desc: t('home.pillar1Desc', 'Farmers list harvested produce directly to verified wholesale & retail buyers. Zero middlemen cuts with full price transparency and fast settlement.'),
                badge: t('nav.middlemanGuarantee', '0% Brokerage'),
                link: '/products',
                stagger: 'stagger-1'
              },
              {
                icon: FaChartLine,
                title: t('home.pillar2Title', 'Official Mandi APMC Prices'),
                desc: t('home.pillar2Desc', 'Live commodity prices fetched directly from government APMC mandi databases. Check min, max, and modal rates across Gujarat and all Indian states.'),
                badge: t('nav.liveSync', 'Live Data'),
                link: '/mandi',
                stagger: 'stagger-2'
              },
              {
                icon: FaHandshake,
                title: t('home.pillar4Title', 'Agronomy Consultations'),
                desc: t('home.pillar4Desc', 'Book verified agricultural specialists for 1-on-1 sessions. Get tailored diagnosis on soil chemistry, pest infestation, and fertilizer strategies.'),
                badge: t('home.trustAgronomists', 'Ph.D. Experts'),
                link: '/experts',
                stagger: 'stagger-3'
              },
            ].map((f, i) => (
              <div key={i} className={`card-luxe p-5 sm:p-8 flex flex-col group animate-slide-up ${f.stagger}`}>
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-tr from-brand-700 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/20 group-hover:scale-105 group-hover:rotate-12 transition-all duration-300">
                    <f.icon className="text-lg sm:text-2xl" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-surface-900 mb-1.5 sm:mb-2 font-display">{f.title}</h3>
                <p className="text-surface-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">{f.desc}</p>
                <Link to={f.link} className="text-xs font-bold text-brand-700 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  {t('common.viewDetails', 'Access Portal')} <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGRITECH INNOVATION & SMART TOOLS SUITE */}
      <section className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-emerald-50/50 via-white/80 to-transparent relative overflow-hidden border-y border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-100/90 px-3.5 py-1 rounded-full border border-emerald-300 shadow-sm backdrop-blur-sm">
              {t('nav.smartTools', 'Flagship AgriTech Innovation Tools')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-surface-900 font-display mt-3 sm:mt-4">
              Smart Digital Agricultural Suite
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-surface-600 font-medium">
              Cutting-edge AI diagnostics, soil advisory, government subsidies, and farm-to-table digital passports built for modern Indian agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {[
              {
                title: 'AI Crop Doctor',
                desc: 'Instant 24/7 leaf disease diagnosis using deep vision AI. Get treatment recommendations in seconds.',
                badge: '24/7 AI Diagnostic',
                icon: FaMicroscope,
                link: '/disease',
                badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
                iconBg: 'from-rose-600 to-amber-600',
              },
              {
                title: 'AI Soil & Crop Advisor',
                desc: 'Precision crop advisory based on soil NPK, pH, and climate parameters to optimize seasonal yield.',
                badge: 'AI Recommendation',
                icon: FaLeaf,
                link: '/crop-advisor',
                badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                iconBg: 'from-emerald-600 to-teal-600',
              },
              {
                title: 'Fertilizer Dosage Calculator',
                desc: 'Calculate exact acreage bags of Urea, DAP, Potash & organic manure to eliminate overspending.',
                badge: 'Dosage Engine',
                icon: FaCalculator,
                link: '/fertilizer-calc',
                badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
                iconBg: 'from-blue-600 to-indigo-600',
              },
              {
                title: 'Govt Schemes & Subsidies',
                desc: 'Explore Central and Gujarat i-Khedut schemes, solar pump grants, drip irrigation subsidies & portals.',
                badge: 'Subsidies & Portals',
                icon: FaLandmark,
                link: '/schemes',
                badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
                iconBg: 'from-amber-600 to-harvest-600',
              },
              {
                title: 'Freight & Transport Estimator',
                desc: 'Real-time doorstep logistics estimator for pickups, tempos, and trucks from farm gate to market.',
                badge: 'Logistics Calculator',
                icon: FaTruck,
                link: '/freight-calc',
                badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                iconBg: 'from-teal-600 to-emerald-600',
              },
              {
                title: 'Digital Crop Passport & QR',
                desc: 'Farm-to-fork batch traceability and quality guarantee with verifiable tamper-proof QR passports.',
                badge: 'Blockchain & QR Trace',
                icon: FaQrcode,
                link: '/passport',
                badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
                iconBg: 'from-purple-600 to-indigo-600',
              },
            ].map((tool, idx) => (
              <div 
                key={idx}
                className="card-luxe p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-400 group transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-tr ${tool.iconBg} text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300`}>
                      <tool.icon className="text-xl" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 font-display mb-2 group-hover:text-brand-900 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-surface-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                    {tool.desc}
                  </p>
                </div>
                <Link 
                  to={tool.link} 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 group-hover:gap-2.5 transition-all pt-2 border-t border-surface-100"
                >
                  <span>Launch Tool</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FARMER DIRECT PROFIT COMPARISON CALCULATOR */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <MiddlemanProfitCalculator />
      </section>

      {/* TRUSTED BY FARMERS SECTION */}
      <section className="py-20 bg-white/60 backdrop-blur-xl border-t border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-surface-900 font-display">
              {t('common.verified', 'Trusted')} by Farmers
            </h2>
            <p className="mt-3 text-base text-surface-600 font-medium">Hear from our community across India.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ramesh Patel', loc: 'Gujarat', quote: 'Smart Krushi Bazar completely changed how I sell my harvest. Zero commission and instant payments!', stagger: 'stagger-1' },
              { name: 'Suresh Kumar', loc: 'Maharashtra', quote: 'The 24/7 AI crop diagnostic helped me save my tomato crop from early blight. The specialist advice was spot on.', stagger: 'stagger-2' },
              { name: 'Amit Singh', loc: 'Punjab', quote: 'Checking live APMC Mandi rates before selling has given me negotiating power I never had before. Highly recommended.', stagger: 'stagger-3' },
            ].map((tItem, i) => (
              <div key={i} className={`card-luxe p-8 flex flex-col transition-all animate-slide-up ${tItem.stagger}`}>
                <div className="flex text-harvest-400 mb-4 gap-1 text-sm">
                  {[...Array(5)].map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="text-surface-700 italic mb-6 text-sm flex-1 font-medium">"{tItem.quote}"</p>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-surface-200/70">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-brand-800 font-bold flex items-center justify-center font-display shadow-sm">
                    {tItem.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900 text-sm">{tItem.name}</h4>
                    <p className="text-xs text-surface-500 font-medium">{tItem.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 text-white relative overflow-hidden">
        {/* Floating decorative blobs */}
        <div className="absolute top-0 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl animate-orbit pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-40 h-40 bg-harvest-500/20 rounded-full blur-2xl animate-orbit pointer-events-none" style={{ animationDirection: 'reverse' }}></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight">
            {t('home.readyTitle', 'Ready to empower your agricultural harvest?')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-100/90 max-w-2xl mx-auto">
            {t('home.readyDesc', 'Join thousands of Indian farmers and buyers on Smart Krushi Bazar today. Instant registration with full mobile support.')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-harvest text-sm sm:text-base px-8 py-3.5 rounded-2xl">
              {t('home.startTrading', 'Create Free Account Now')}
            </Link>
            <Link to="/products" className="btn-saas-secondary text-sm sm:text-base px-8 py-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 border-white/20">
              {t('marketplace.title', 'Browse Marketplace')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
