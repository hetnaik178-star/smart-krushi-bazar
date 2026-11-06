import { getMandiComparison } from '../utils/mandiDealHelper';
import { FaTag, FaFire, FaPercentage, FaLeaf } from 'react-icons/fa';

export default function MandiDealBadge({ productName, price, size = 'sm' }) {
  const comparison = getMandiComparison(productName, price);

  if (!comparison) return null;

  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 max-w-full'
    : 'text-xs px-2.5 py-1 max-w-full';

  if (comparison.dealLevel === 'SUPER_DEAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-extrabold rounded-full bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-sm tracking-wide truncate ${sizeClasses}`}
        title={`Farmer price ₹${comparison.farmerPrice} vs APMC Mandi ₹${comparison.mandiPrice}/kg`}
      >
        <FaFire className="text-amber-200 text-[8px] sm:text-[9px] shrink-0 animate-pulse" />
        <span className="truncate">Save ₹{comparison.diffMandi}/kg <span className="hidden sm:inline">vs Mandi ({comparison.percentSavedMandi}% Off)</span></span>
      </span>
    );
  }

  if (comparison.dealLevel === 'MANDI_DEAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm truncate ${sizeClasses}`}
        title={`APMC Mandi Wholesale benchmark is ₹${comparison.mandiPrice}/kg`}
      >
        <FaPercentage className="text-emerald-600 text-[8px] shrink-0" />
        <span className="truncate"><span className="hidden sm:inline">Mandi Deal • </span>Save ₹{comparison.diffMandi}/kg</span>
      </span>
    );
  }

  if (comparison.dealLevel === 'RETAIL_DEAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200 shadow-sm truncate ${sizeClasses}`}
        title={`Supermarket benchmark is ₹${comparison.retailPrice}/kg`}
      >
        <FaTag className="text-teal-600 text-[8px] shrink-0" />
        <span className="truncate">{comparison.percentSavedRetail}% Below Retail</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-surface-50 text-surface-700 border border-surface-200 truncate ${sizeClasses}`}
    >
      <FaLeaf className="text-emerald-600 text-[8px] sm:text-[9px] shrink-0" />
      <span className="truncate">Direct Farm</span>
    </span>
  );
}
