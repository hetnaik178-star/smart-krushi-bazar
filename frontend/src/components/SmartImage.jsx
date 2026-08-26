import { useState } from 'react';
import { FaLeaf } from 'react-icons/fa';

const SmartImage = ({ src, alt, className = '', fallbackIcon = FaLeaf }) => {
  const [error, setError] = useState(false);
  const Icon = fallbackIcon;

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-harvest-50 text-brand-300 ${className}`}>
        <Icon className="w-1/3 h-1/3 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
    />
  );
};

export default SmartImage;
