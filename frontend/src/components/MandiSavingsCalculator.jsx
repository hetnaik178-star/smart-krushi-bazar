import { useState } from 'react';
import { getMandiComparison } from '../utils/mandiDealHelper';
import { FaCoins, FaCheckCircle, FaShieldAlt, FaInfoCircle, FaChartLine } from 'react-icons/fa';

export default function MandiSavingsCalculator({ productName, price, unit = 'kg', quantity = 1 }) {
  const comparison = getMandiComparison(productName, price);
  const [sliderQty, setSliderQty] = useState(quantity || 1);

  // Sync with prop quantity when updated
  const qty = Number(quantity) || Number(sliderQty) || 1;

  const totalFarmer = comparison.farmerPrice * qty;
  const totalMandi = comparison.mandiPrice * qty;
  const totalRetail = comparison.retailPrice * qty;

  const savedVsMandi = Math.max(0, totalMandi - totalFarmer);
  const savedVsRetail = Math.max(0, totalRetail - totalFarmer);

  return (
    <div className="card-luxe p-5 sm:p-6 bg-gradient-to-br from-emerald-900 via-brand-950 to-surface-900 text-white shadow-xl rounded-2xl border border-emerald-500/30 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-harvest-400/20 text-harvest-300 flex items-center justify-center text-base border border-harvest-400/30">
            <FaCoins />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-harvest-300">
              <FaChartLine className="text-[9px]" /> Live Mandi vs Farm Savings
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-white">
              Price Transparency & Savings Analysis
            </h3>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
          <FaShieldAlt className="text-[9px]" /> 0% Middleman Loss
        </span>
      </div>

      {/* 3-Way Benchmark Columns */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 text-center relative z-10">
        {/* Farm Direct Price */}
        <div className="p-3 rounded-xl bg-emerald-600/30 border-2 border-emerald-400 shadow-inner">
          <p className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">Farm Direct</p>
          <p className="text-lg sm:text-xl font-black text-white font-display mt-0.5">₹{comparison.farmerPrice}</p>
          <p className="text-[10px] text-emerald-200/80 font-medium">/{unit} (Current)</p>
        </div>

        {/* APMC Mandi Benchmark */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-extrabold text-surface-300 uppercase tracking-wider">APMC Mandi</p>
          <p className="text-lg sm:text-xl font-black text-surface-200 font-display mt-0.5">₹{comparison.mandiPrice}</p>
          <p className="text-[10px] text-surface-400 font-medium">/{unit} (Wholesale)</p>
        </div>

        {/* Supermarket Retail Benchmark */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-extrabold text-surface-300 uppercase tracking-wider">City Retail</p>
          <p className="text-lg sm:text-xl font-black text-surface-200 font-display mt-0.5">₹{comparison.retailPrice}</p>
          <p className="text-[10px] text-surface-400 font-medium">/{unit} (Market Avg)</p>
        </div>
      </div>

      {/* Savings Box for Current Quantity */}
      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-brand-100 font-medium">
              Your Total Savings on <span className="font-bold text-white underline">{qty} {unit}</span> order:
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xl sm:text-2xl font-black text-harvest-300 font-display">
                ₹{savedVsMandi > 0 ? savedVsMandi : savedVsRetail} Saved!
              </span>
              {comparison.percentSavedMandi > 0 && (
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {comparison.percentSavedMandi}% cheaper than Mandi
                </span>
              )}
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
            <p className="text-[10px] uppercase tracking-wider text-surface-300 font-bold">Total Order Cost</p>
            <p className="text-base sm:text-lg font-black text-white font-display">₹{totalFarmer}</p>
            <p className="text-[10px] text-emerald-300 line-through">Retail: ₹{totalRetail}</p>
          </div>
        </div>
      </div>

      {/* Trust Footer Note */}
      <p className="text-[11px] text-emerald-200/70 mt-3 flex items-center gap-1.5 relative z-10 font-medium">
        <FaCheckCircle className="text-emerald-400 text-[10px] shrink-0" />
        <span>Wholesale APMC pricing calculated from verified Gujarat APMC mandi records. 100% direct value to farmers.</span>
      </p>
    </div>
  );
}
