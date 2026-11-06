import React, { useState } from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
    '3xl': 'w-36 h-36 text-3xl',
  };

  const initials = name
    ? name.trim().split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const sizeClass = sizes[size] || sizes.md;

  // Resolve backend upload paths if needed
  const resolveSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      // Use relative path — Vite proxy forwards /uploads to backend on both desktop & mobile
      return url;
    }
    return url;
  };

  const finalSrc = resolveSrc(src);

  if (finalSrc && !hasError) {
    return (
      <img
        src={finalSrc}
        alt={name || 'User avatar'}
        onError={() => setHasError(true)}
        className={`${sizeClass} shrink-0 aspect-square rounded-full object-cover border border-emerald-500/30 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} shrink-0 aspect-square rounded-full bg-gradient-to-br from-brand-600 via-emerald-600 to-teal-700 flex items-center justify-center text-white font-black shadow-sm border border-emerald-400/40 select-none ${className}`}
      role="img"
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
};

export default Avatar;
