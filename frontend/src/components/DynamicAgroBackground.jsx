import React, { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * DynamicAgroBackground
 * Senior UX Architecture: Role-Based & Route-Based Atmospheric Background Engine
 * Delivers distinct, tailored aesthetic environments for Farmers, Buyers, Experts, Admins, and Public Visitors.
 */
const DynamicAgroBackground = ({ previewRole = null }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Determine current active persona/theme
  const currentTheme = useMemo(() => {
    // If preview role is explicitly set (e.g., during registration role selection)
    if (previewRole) return previewRole.toLowerCase();

    // Logged-in user's role takes priority
    if (user?.role) {
      const r = user.role.toLowerCase();
      if (r === 'farmer') return 'farmer';
      if (r === 'buyer') return 'buyer';
      if (r === 'expert') return 'expert';
      if (r === 'admin') return 'admin';
    }

    // Path-based fallback detection
    const p = location.pathname.toLowerCase();
    if (p.startsWith('/farmer') || p === '/disease') return 'farmer';
    if (p.startsWith('/buyer') || p === '/cart' || p.startsWith('/checkout') || p.startsWith('/wishlist')) return 'buyer';
    if (p.startsWith('/expert')) return 'expert';
    if (p.startsWith('/admin')) return 'admin';

    return 'public';
  }, [user, location.pathname, previewRole]);

  // Persona configurations: Photography, Lighting Orbs, Overlay Gradients, and Vector Accents
  const themes = {
    farmer: {
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop',
      alt: 'Lush Harvest Sunrise',
      overlay: 'linear-gradient(135deg, rgba(236, 253, 245, 0.80) 0%, rgba(254, 243, 199, 0.74) 50%, rgba(236, 253, 245, 0.82) 100%)',
      orb1: 'rgba(16, 185, 129, 0.28)', // Emerald
      orb2: 'rgba(245, 158, 11, 0.24)',  // Harvest Gold
      orb3: 'rgba(5, 150, 105, 0.18)',   // Forest Green
      tag: 'Kisan Krushi Ecosystem',
      vector: 'leaf'
    },
    buyer: {
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop',
      alt: 'Fresh Produce Wholesale Market',
      overlay: 'linear-gradient(135deg, rgba(240, 253, 250, 0.82) 0%, rgba(239, 246, 255, 0.78) 50%, rgba(240, 253, 250, 0.84) 100%)',
      orb1: 'rgba(13, 148, 136, 0.26)',  // Teal
      orb2: 'rgba(37, 99, 235, 0.20)',   // Royal Blue
      orb3: 'rgba(234, 179, 8, 0.18)',   // Citrus Gold
      tag: 'Fresh Produce Marketplace',
      vector: 'grid'
    },
    expert: {
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop',
      alt: 'Botanical Plant Pathology Laboratory',
      overlay: 'linear-gradient(135deg, rgba(238, 242, 255, 0.82) 0%, rgba(236, 254, 255, 0.76) 50%, rgba(245, 243, 255, 0.84) 100%)',
      orb1: 'rgba(6, 182, 212, 0.28)',   // Bio Cyan
      orb2: 'rgba(99, 102, 241, 0.24)',  // Indigo
      orb3: 'rgba(168, 85, 247, 0.20)',  // Violet
      tag: 'Agronomy Diagnostic HUD',
      vector: 'dna'
    },
    admin: {
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      alt: 'Satellite GIS Agricultural Telemetry',
      overlay: 'linear-gradient(135deg, rgba(241, 245, 249, 0.82) 0%, rgba(245, 243, 255, 0.78) 50%, rgba(241, 245, 249, 0.84) 100%)',
      orb1: 'rgba(15, 23, 42, 0.26)',    // Slate Obsidian
      orb2: 'rgba(124, 58, 237, 0.24)',  // Sovereign Violet
      orb3: 'rgba(245, 158, 11, 0.20)',  // Gold Telemetry
      tag: 'Platform Governance Telemetry',
      vector: 'topo'
    },
    public: {
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop',
      alt: 'Panoramic Indian Farmland Sunrise',
      overlay: 'linear-gradient(135deg, rgba(236, 253, 245, 0.80) 0%, rgba(254, 243, 199, 0.74) 50%, rgba(236, 253, 245, 0.82) 100%)',
      orb1: 'rgba(16, 185, 129, 0.26)',  // Emerald
      orb2: 'rgba(245, 158, 11, 0.22)',  // Amber
      orb3: 'rgba(4, 120, 87, 0.16)',    // Deep Forest
      tag: 'Smart Krushi Platform',
      vector: 'leaf'
    }
  };

  const active = themes[currentTheme] || themes.public;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── Layer 1: Hardware-Accelerated Photographic Backdrop with Smooth Transition ── */}
      <div 
        key={currentTheme}
        className="absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ease-out will-change-transform"
        style={{
          backgroundImage: `url('${active.image}')`,
          filter: 'brightness(1.02) contrast(1.04) saturate(1.15)',
        }}
      />

      {/* ── Layer 2: Persona-Tuned Color Atmosphere Overlay ── */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: active.overlay }}
      />

      {/* ── Layer 3: Dynamic Ambient Glowing Orbs ── */}
      <div 
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] transition-all duration-1000 ease-out animate-pulse-slow"
        style={{ background: active.orb1 }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-1000 ease-out"
        style={{ background: active.orb2 }}
      />
      <div 
        className="absolute -bottom-40 left-1/4 w-[750px] h-[750px] rounded-full blur-[160px] transition-all duration-1000 ease-out"
        style={{ background: active.orb3 }}
      />

      {/* ── Layer 4: Micro-Texture Pattern ── */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(#059669 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Layer 5: Role Signature Watermark Tag (Bottom-Right Corner) ── */}
      <div className="absolute bottom-3 right-5 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[10px] font-extrabold uppercase tracking-widest text-surface-600 shadow-sm opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span>{active.tag}</span>
      </div>
    </div>
  );
};

export default DynamicAgroBackground;
