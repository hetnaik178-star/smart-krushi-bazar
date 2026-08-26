import { Link } from 'react-router-dom';
import { FaArrowRight, FaChartLine, FaShieldAlt, FaTractor, FaLeaf, FaHandshake, FaSeedling, FaRupeeSign, FaBolt, FaUserCheck, FaMicroscope } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="bg-white page-fade-in overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-950 via-brand-900 to-brand-950 text-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Top Floating Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-harvest-300 px-4 py-1.5 rounded-full text-xs font-extrabold mb-8 border border-white/15 shadow-glow-harvest animate-float">
              <FaLeaf className="text-emerald-400" /> India's Direct AgriTech Marketplace & Consultation
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display leading-[1.15]">
              Direct Farm Trade <br />
              <span className="bg-gradient-to-r from-emerald-300 via-harvest-300 to-amber-400 bg-clip-text text-transparent">
                Powered by Smart Agriculture
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-brand-100/90 max-w-2xl mx-auto font-medium">
              Eliminate middlemen commission. Get live APMC Mandi prices, 24/7 AI crop disease diagnostic, and 1-on-1 certified agronomy specialist advisories.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/products" className="btn-harvest text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-glow-harvest group">
                Explore Fresh Harvest <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn-saas-secondary text-sm sm:text-base px-8 py-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md">
                Register as Farmer
              </Link>
            </div>

            {/* Live Trust Badges Pill Bar */}
            <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-brand-200/90 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><FaShieldAlt className="text-emerald-400" /> 0% Middleman Loss</span>
              <span className="flex items-center gap-1.5"><FaBolt className="text-harvest-400" /> Instant Razorpay & COD</span>
              <span className="flex items-center gap-1.5"><FaUserCheck className="text-emerald-400" /> Certified Agronomists</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS & IMPACT SECTION */}
      <section className="py-12 bg-surface-50 border-b border-surface-200/80 -mt-8 relative z-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { val: '10,000+', label: 'Registered Farmers', icon: FaTractor, color: 'text-brand-700' },
            { val: '₹12Cr+', label: 'Direct Trade Value', icon: FaRupeeSign, color: 'text-harvest-600' },
            { val: '500+', label: 'Verified Specialists', icon: FaMicroscope, color: 'text-brand-700' },
            { val: '24/7', label: 'AI Crop Diagnostic', icon: FaSeedling, color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="card-saas p-6 sm:p-7 flex flex-col items-center justify-center hover:border-brand-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-700 flex items-center justify-center mb-3">
                <s.icon className="text-lg" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-surface-900 font-display">{s.val}</p>
              <p className="mt-1 text-xs text-surface-500 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 CORE PILLARS OF SMART KRUSHI BAZAR */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <span className="text-xs font-extrabold text-brand-700 uppercase tracking-widest bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Complete Agricultural Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-surface-900 font-display mt-4">
              Everything A Modern Farmer Needs
            </h2>
            <p className="mt-3 text-base text-surface-600">
              Integrated digital tools engineered to maximize crop yield, reduce logistics overhead, and ensure fair prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaTractor,
                title: 'Direct Trade Marketplace',
                desc: 'Farmers list harvested produce directly to verified wholesale & retail buyers. Zero middlemen cuts with full price transparency and fast settlement.',
                badge: '0% Brokerage',
                link: '/products'
              },
              {
                icon: FaChartLine,
                title: 'Official Mandi APMC Prices',
                desc: 'Live commodity prices fetched directly from government APMC mandi databases. Check min, max, and modal rates across Gujarat and all Indian states.',
                badge: 'Live Data',
                link: '/mandi'
              },
              {
                icon: FaHandshake,
                title: 'Agronomy Consultations',
                desc: 'Book verified agricultural specialists for 1-on-1 sessions. Get tailored diagnosis on soil chemistry, pest infestation, and fertilizer strategies.',
                badge: 'Ph.D. Experts',
                link: '/experts'
              },
            ].map((f, i) => (
              <div key={i} className="card-saas p-8 flex flex-col hover:border-emerald-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-brand-700 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-brand-900/15 group-hover:scale-105 transition-transform">
                    <f.icon className="text-2xl" />
                  </div>
                  <span className="text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2 font-display">{f.title}</h3>
                <p className="text-surface-600 text-xs sm:text-sm leading-relaxed mb-6 flex-1">{f.desc}</p>
                <Link to={f.link} className="text-xs font-bold text-brand-700 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Access Portal <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight">
            Ready to empower your agricultural harvest?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-100/90 max-w-2xl mx-auto">
            Join thousands of Indian farmers and buyers on Smart Krushi Bazar today. Instant registration with full mobile support.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-harvest text-sm sm:text-base px-8 py-3.5 rounded-2xl">
              Create Free Account Now
            </Link>
            <Link to="/products" className="btn-saas-secondary text-sm sm:text-base px-8 py-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 border-white/20">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
