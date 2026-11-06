import { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setExit(true), 2200); // Start exit transition
    const timer2 = setTimeout(() => onFinish(), 2700);    // Unmount
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  const handleSkip = () => {
    setExit(true);
    setTimeout(onFinish, 600);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${exit ? 'opacity-0 scale-105 blur-md' : 'opacity-100 scale-100 blur-0'}`}>

      {/* 0.0-0.8s: Dark Dawn Atmosphere & Particles */}
      <div className="absolute inset-0 animate-[skyDawn_3.2s_ease-out_forwards]" />

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-harvest-300 rounded-full animate-ping duration-1000" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-brand-200 rounded-full animate-pulse duration-700" />
        <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-yellow-200 rounded-full animate-ping duration-1000" />
      </div>

      {/* 0.8-1.8s: Sun Rising behind landscape with atmospheric halo */}
      <div className="absolute top-[28%] w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-yellow-300 via-harvest-400 to-amber-500 rounded-full shadow-[0_0_140px_rgba(251,191,36,0.65)] animate-[sunRise_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards] opacity-0" />

      {/* 1.5-2.7s: 4 Layered Farmland Depth Layers */}
      <div className="absolute bottom-0 w-full h-3/5">
        {/* Layer 1: Distant Background Hills */}
        <svg className="absolute bottom-0 w-full h-full animate-[hillSlide_2s_1.2s_ease-out_forwards] opacity-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#0f392b" opacity="0.9" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L0,320Z" />
        </svg>

        {/* Layer 2: Middle Farmland */}
        <svg className="absolute bottom-0 w-full h-4/5 animate-[hillSlide_2s_1.5s_ease-out_forwards] opacity-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#14532d" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L0,320Z" />
        </svg>

        {/* Layer 3: Crop Rows */}
        <svg className="absolute bottom-0 w-full h-3/5 animate-[hillSlide_2s_1.7s_ease-out_forwards] opacity-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#166534" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L0,320Z" />
        </svg>

        {/* Layer 4: Foreground Crops */}
        <svg className="absolute bottom-0 w-full h-2/5 animate-[hillSlide_2s_1.9s_ease-out_forwards] opacity-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#15803d" opacity="0.95" d="M0,300L60,290C120,280,240,260,360,255C480,250,600,260,720,270C840,280,960,290,1080,285C1200,280,1320,260,1380,250L1440,240L1440,320L0,320Z" />
        </svg>
      </div>

      {/* Swaying Foreground Grass / Wheat */}
      <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-40 overflow-hidden">
        {/* Wheat stalk 1 */}
        <div className="absolute bottom-0 left-[10%] animate-[sway_3s_ease-in-out_infinite] origin-bottom opacity-0 animate-[fadeIn_1s_2s_forwards]">
          <svg width="40" height="120" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 120 Q 20 60, 15 0" stroke="#166534" strokeWidth="3" fill="none" />
            <ellipse cx="15" cy="20" rx="3" ry="10" transform="rotate(20 15 20)" fill="#15803d" />
            <ellipse cx="18" cy="30" rx="3" ry="10" transform="rotate(-20 18 30)" fill="#15803d" />
            <ellipse cx="15" cy="40" rx="3" ry="10" transform="rotate(20 15 40)" fill="#15803d" />
            <ellipse cx="18" cy="50" rx="3" ry="10" transform="rotate(-20 18 50)" fill="#15803d" />
          </svg>
        </div>
        {/* Wheat stalk 2 */}
        <div className="absolute bottom-[-10px] left-[15%] animate-[sway_4s_ease-in-out_infinite_0.5s] origin-bottom opacity-0 animate-[fadeIn_1s_2.2s_forwards]">
          <svg width="30" height="90" viewBox="0 0 30 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 90 Q 20 45, 10 0" stroke="#14532d" strokeWidth="2.5" fill="none" />
            <ellipse cx="10" cy="15" rx="2" ry="8" transform="rotate(15 10 15)" fill="#166534" />
            <ellipse cx="12" cy="25" rx="2" ry="8" transform="rotate(-15 12 25)" fill="#166534" />
            <ellipse cx="9" cy="35" rx="2" ry="8" transform="rotate(15 9 35)" fill="#166534" />
          </svg>
        </div>
        {/* Wheat stalk 3 */}
        <div className="absolute bottom-[-5px] right-[10%] animate-[sway_3.5s_ease-in-out_infinite_1s] origin-bottom opacity-0 animate-[fadeIn_1s_2.5s_forwards]">
          <svg width="45" height="130" viewBox="0 0 45 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 130 Q 30 65, 20 0" stroke="#166534" strokeWidth="3" fill="none" />
            <ellipse cx="20" cy="25" rx="3" ry="11" transform="rotate(-25 20 25)" fill="#15803d" />
            <ellipse cx="25" cy="40" rx="3" ry="11" transform="rotate(25 25 40)" fill="#15803d" />
            <ellipse cx="18" cy="55" rx="3" ry="11" transform="rotate(-25 18 55)" fill="#15803d" />
            <ellipse cx="24" cy="70" rx="3" ry="11" transform="rotate(25 24 70)" fill="#15803d" />
          </svg>
        </div>
      </div>

      {/* 2.0-3.2s: Stylized Farmer Silhouette in the Field */}
      <div className="absolute bottom-[22%] right-[18%] md:right-[25%] z-20 animate-[fadeInFarmer_2s_2.0s_ease-out_forwards] opacity-0">
        <svg width="48" height="72" viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          {/* Farmer Hat */}
          <ellipse cx="24" cy="14" rx="16" ry="4" fill="#d97706" />
          <path d="M16 14 C16 8, 32 8, 32 14 Z" fill="#b45309" />
          {/* Head & Torso */}
          <circle cx="24" cy="18" r="5" fill="#1c1917" />
          <path d="M14 26 L34 26 L30 52 L18 52 Z" fill="#15803d" />
          {/* Arms holding crop */}
          <path d="M14 28 L6 40 L12 42 L18 32 Z" fill="#1c1917" />
          <path d="M34 28 L42 38 L36 40 L30 32 Z" fill="#1c1917" />
          {/* Legs */}
          <rect x="18" y="52" width="5" height="18" fill="#1c1917" />
          <rect x="25" y="52" width="5" height="18" fill="#1c1917" />
        </svg>
      </div>

      {/* 2.5-3.8s: Tractor with Wheel Rotation & Soft Dust Trail */}
      <div className="absolute bottom-[18%] left-0 w-full h-20 z-30 animate-[tractorDrive_3.5s_2.2s_ease-in-out_forwards] opacity-0">
        <div className="relative inline-block">
          {/* Dust Trail */}
          <div className="absolute -left-12 bottom-2 flex space-x-1 opacity-60">
            <div className="w-4 h-4 bg-amber-200/40 rounded-full animate-ping duration-700" />
            <div className="w-6 h-6 bg-amber-300/30 rounded-full animate-pulse duration-500" />
          </div>
          {/* Tractor SVG */}
          <svg width="110" height="75" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            <rect x="85" y="15" width="6" height="25" rx="2" fill="#475569" />
            <path d="M40 20 L75 20 L80 45 L35 45 Z" fill="#064e3b" />
            <path d="M45 25 L70 25 L73 40 L42 40 Z" fill="#bae6fd" />
            <rect x="20" y="45" width="70" height="15" rx="4" fill="#15803d" />
            {/* Rear Wheel with Spoke Rotation */}
            <g className="animate-[wheelSpin_1.5s_linear_infinite]">
              <circle cx="70" cy="60" r="18" fill="#1e293b" />
              <circle cx="70" cy="60" r="6" fill="#94a3b8" />
              <line x1="70" y1="42" x2="70" y2="78" stroke="#94a3b8" strokeWidth="2" />
              <line x1="52" y1="60" x2="88" y2="60" stroke="#94a3b8" strokeWidth="2" />
            </g>
            {/* Front Wheel */}
            <g className="animate-[wheelSpin_1.5s_linear_infinite]">
              <circle cx="25" cy="65" r="12" fill="#1e293b" />
              <circle cx="25" cy="65" r="4" fill="#94a3b8" />
              <line x1="25" y1="53" x2="25" y2="77" stroke="#94a3b8" strokeWidth="2" />
              <line x1="13" y1="65" x2="37" y2="65" stroke="#94a3b8" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      {/* 3.4-4.5s: Elegant Brand Reveal */}
      <div className="z-40 text-center px-4 animate-[textReveal_1.4s_3.2s_cubic-bezier(0.22,1,0.36,1)_forwards] opacity-0">
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tighter">
          SMART KRUSHI BAZAR
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3 text-emerald-100 font-semibold tracking-wide text-xs md:text-sm uppercase">
          <span className="w-10 h-[1.5px] bg-harvest-400"></span>
          Empowering Farmers • Connecting Buyers • Growing Futures
          <span className="w-10 h-[1.5px] bg-harvest-400"></span>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-50 px-4 py-2 text-xs font-semibold text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all animate-fade-in duration-1000 delay-1000"
      >
        Skip
      </button>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes skyDawn {
          0% { background: linear-gradient(to bottom, #061017, #0f2330, #1c1917); }
          50% { background: linear-gradient(to bottom, #1e293b, #451a03, #b45309); }
          100% { background: linear-gradient(to bottom, #fef08a, #fde047, #bbf7d0); }
        }
        @keyframes sunRise {
          0% { transform: translateY(110px) scale(0.75); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes hillSlide {
          0% { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInFarmer {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tractorDrive {
          0% { transform: translateX(-160px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 160px)); opacity: 0; }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); transform-origin: center; }
          to { transform: rotate(360deg); transform-origin: center; }
        }
        @keyframes textReveal {
          0% { transform: translateY(35px); opacity: 0; filter: blur(12px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
