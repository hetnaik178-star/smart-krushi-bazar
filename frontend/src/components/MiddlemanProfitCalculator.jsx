import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaBalanceScale, FaMoneyBillWave, FaArrowRight, FaTrophy, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import WhatsAppShareButton from './WhatsAppShareButton';

const COMMODITY_BENCHMARKS = {
  tomatoes: {
    name: 'Tomatoes (Tamatar)',
    hindiName: 'टमाटर',
    gujaratiName: 'ટામેટાં',
    icon: '🍅',
    mandiTraderRate: 14,
    smartKrushiRate: 28,
    retailConsumerPrice: 38,
    defaultKg: 1500
  },
  mangoes: {
    name: 'Alphonso Mangoes',
    hindiName: 'हापुस आम',
    gujaratiName: 'આફૂસ કેરી',
    icon: '🥭',
    mandiTraderRate: 65,
    smartKrushiRate: 120,
    retailConsumerPrice: 160,
    defaultKg: 800
  },
  wheat: {
    name: 'Sharbati Wheat (Gehun)',
    hindiName: 'शरबती गेहूं',
    gujaratiName: 'શરબતી ઘઉં',
    icon: '🌾',
    mandiTraderRate: 24,
    smartKrushiRate: 38,
    retailConsumerPrice: 48,
    defaultKg: 3000
  },
  onions: {
    name: 'Fresh Red Onions (Piyaz)',
    hindiName: 'लाल प्याज',
    gujaratiName: 'લાલ ડુંગળી',
    icon: '🧅',
    mandiTraderRate: 11,
    smartKrushiRate: 22,
    retailConsumerPrice: 32,
    defaultKg: 2000
  },
  potatoes: {
    name: 'Deesa Potatoes (Alu)',
    hindiName: 'आलू',
    gujaratiName: 'બટાકા',
    icon: '🥔',
    mandiTraderRate: 12,
    smartKrushiRate: 24,
    retailConsumerPrice: 35,
    defaultKg: 2500
  },
  cotton: {
    name: 'Bt Cotton (Kapas)',
    hindiName: 'कपास',
    gujaratiName: 'કપાસ',
    icon: '☁️',
    mandiTraderRate: 62,
    smartKrushiRate: 84,
    retailConsumerPrice: 110,
    defaultKg: 1000
  }
};

export default function MiddlemanProfitCalculator({ className = '' }) {
  const { language } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState('tomatoes');
  const [quantityKg, setQuantityKg] = useState(1500);

  const crop = COMMODITY_BENCHMARKS[selectedCrop] || COMMODITY_BENCHMARKS.tomatoes;

  // Math Calculations:
  // Middleman route: Middleman rate * kg - 10% APMC/Dalaal cuts
  const middlemanGross = quantityKg * crop.mandiTraderRate;
  const middlemanDeductions = Math.round(middlemanGross * 0.10); // 10% commission, cuts & handling
  const middlemanNetFarmer = middlemanGross - middlemanDeductions;

  // Smart Krushi Bazar route: direct price, 0% commission
  const smartKrushiNetFarmer = quantityKg * crop.smartKrushiRate;

  // Extra Profit
  const extraEarnings = smartKrushiNetFarmer - middlemanNetFarmer;
  const percentageBoost = Math.round((extraEarnings / middlemanNetFarmer) * 100);

  const getCropTitle = (c) => {
    if (language === 'gu') return c.gujaratiName;
    if (language === 'hi') return c.hindiName;
    return c.name;
  };

  return (
    <div className={`rounded-3xl bg-white/90 dark:bg-surface-800/90 backdrop-blur-md p-6 sm:p-8 border border-emerald-500/20 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-200 dark:border-surface-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider mb-1.5 border border-emerald-500/30">
            <FaBalanceScale />
            <span>Economic Transparency Index</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white">
            {language === 'gu'
              ? 'ખેડૂત નફો સરખામણી: દલાલ (વચેટિયા) vs. સ્માર્ટ કૃષિ બજાર'
              : language === 'hi'
              ? 'किसान मुनाफा तुलना: बिचौलिया vs. स्मार्ट कृषि बाज़ार'
              : 'Farmer Direct Earnings vs. Middleman Comparison Calculator'}
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            See the exact monetary impact of eliminating intermediate APMC commissions and multi-layer traders.
          </p>
        </div>

        <WhatsAppShareButton
          title={`Smart Krushi Earnings Comparison: ${getCropTitle(crop)}`}
          text={`By selling ${quantityKg} kg of ${getCropTitle(crop)} directly on Smart Krushi Bazar, farmers gain ₹${extraEarnings.toLocaleString('en-IN')} (+${percentageBoost}%) extra in hand compared to local middlemen! Calculate yours:`}
          className="text-xs"
        />
      </div>

      {/* Commodity Selector Pills */}
      <div className="my-6">
        <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-2">
          {language === 'gu' ? 'પાક પસંદ કરો:' : language === 'hi' ? 'फसल चुनें:' : 'Select Produce:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(COMMODITY_BENCHMARKS).map(([key, c]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedCrop(key);
                setQuantityKg(c.defaultKg);
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedCrop === key
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                  : 'bg-surface-50 dark:bg-surface-700/60 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-emerald-400'
              }`}
            >
              <div className="text-xl">{c.icon}</div>
              <div className="text-[11px] mt-0.5 truncate">{getCropTitle(c)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Slider */}
      <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-700/40 border border-surface-200 dark:border-surface-600 mb-6">
        <div className="flex justify-between items-center text-sm font-semibold mb-2">
          <span className="text-surface-700 dark:text-surface-300">
            {language === 'gu' ? 'વેચાણ જથ્થો (કિલો):' : language === 'hi' ? 'विक्रय मात्रा (किग्रा):' : 'Harvest Volume (kg):'}
          </span>
          <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-base bg-emerald-50 dark:bg-emerald-950/60 px-3 py-0.5 rounded-lg border border-emerald-500/20">
            {quantityKg.toLocaleString('en-IN')} kg ({(quantityKg / 100).toFixed(1)} Quintals)
          </span>
        </div>
        <input
          type="range"
          min="200"
          max="10000"
          step="100"
          value={quantityKg}
          onChange={(e) => setQuantityKg(Number(e.target.value))}
          className="w-full h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] text-surface-400 mt-1">
          <span>200 kg</span>
          <span>5,000 kg</span>
          <span>10,000 kg</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Traditional Middleman Route */}
        <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <FaTimesCircle />
              <span>{language === 'gu' ? 'સ્થાનિક દલાલ / મંડી પદ્ધતિ' : language === 'hi' ? 'पारंपरिक बिचौलिया रूट' : 'Traditional Middleman Route'}</span>
            </span>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold px-2 py-0.5 rounded-full">
              Heavy Deductions
            </span>
          </div>

          <div className="pt-2">
            <div className="text-xs text-surface-500 dark:text-surface-400">Offer Rate:</div>
            <div className="text-xl font-bold text-surface-800 dark:text-surface-200">
              ₹{crop.mandiTraderRate} / kg
            </div>
          </div>

          <div className="text-xs space-y-1 text-surface-600 dark:text-surface-400 pt-2 border-t border-rose-200 dark:border-rose-900/40">
            <div className="flex justify-between">
              <span>Gross Value:</span>
              <span>₹{middlemanGross.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
              <span>Commission & Handling (~10%):</span>
              <span>- ₹{middlemanDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-200 dark:border-rose-900/40">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              {language === 'gu' ? 'ખેડૂતને હાથમાં મળતી રકમ:' : language === 'hi' ? 'किसान को शुद्ध प्राप्ति:' : 'Farmer Net In-Hand:'}
            </div>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-300">
              ₹{middlemanNetFarmer.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Right: Smart Krushi Bazar Route */}
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/50 p-5 space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
            <FaTrophy />
            <span>0% Commission</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-600" />
              <span>{language === 'gu' ? 'સ્માર્ટ કૃષિ બજાર (સીધું વેચાણ)' : language === 'hi' ? 'स्मार्ट कृषि बाज़ार (प्रत्यक्ष)' : 'Smart Krushi Direct Platform'}</span>
            </span>
          </div>

          <div className="pt-2">
            <div className="text-xs text-emerald-700 dark:text-emerald-300">Direct Buyer Price:</div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
              ₹{crop.smartKrushiRate} / kg
            </div>
          </div>

          <div className="text-xs space-y-1 text-surface-600 dark:text-surface-300 pt-2 border-t border-emerald-500/20">
            <div className="flex justify-between">
              <span>Gross Direct Value:</span>
              <span>₹{smartKrushiNetFarmer.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold">
              <span>Platform Fee:</span>
              <span>₹0 (100% Free)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-500/20">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {language === 'gu' ? 'ખેડૂતને હાથમાં મળતી રકમ:' : language === 'hi' ? 'किसान को शुद्ध प्राप्ति:' : 'Farmer Net In-Hand:'}
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
              ₹{smartKrushiNetFarmer.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Extra Cash Gain Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            <FaMoneyBillWave />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold">
              {language === 'gu' ? 'ખેડૂતનો સીધો વધારાનો નફો' : language === 'hi' ? 'किसान का सीधा अतिरिक्त लाभ' : 'Direct Extra Farmer Gain'}
            </div>
            <div className="text-xl sm:text-2xl font-black">
              + ₹{extraEarnings.toLocaleString('en-IN')} ({percentageBoost}% Extra in Hand!)
            </div>
          </div>
        </div>

        <div className="text-xs font-medium text-emerald-100 bg-white/10 px-4 py-2 rounded-xl border border-white/20 shrink-0">
          🌱 100% of consumer money goes directly to farmer bank account
        </div>
      </div>
    </div>
  );
}
