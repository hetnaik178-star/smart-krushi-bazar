import React from 'react';
import { FaLeaf, FaShoppingBasket, FaShieldAlt, FaUserMd } from 'react-icons/fa';

const RoleBadge = ({ role, size = 'md' }) => {
  const configs = {
    Farmer: {
      icon: FaLeaf,
      label: 'Verified Farmer',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconClasses: 'text-brand-600'
    },
    Buyer: {
      icon: FaShoppingBasket,
      label: 'Registered Buyer',
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
      iconClasses: 'text-blue-600'
    },
    Expert: {
      icon: FaUserMd,
      label: 'Agronomy Specialist',
      classes: 'bg-harvest-50 text-harvest-800 border-harvest-200',
      iconClasses: 'text-harvest-600'
    },
    Admin: {
      icon: FaShieldAlt,
      label: 'Platform Admin',
      classes: 'bg-purple-50 text-purple-800 border-purple-200',
      iconClasses: 'text-purple-600'
    }
  };

  const config = configs[role] || configs.Buyer;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${config.classes} ${sizeClasses}`}>
      <Icon className={config.iconClasses} />
      {config.label}
    </span>
  );
};

export default RoleBadge;
