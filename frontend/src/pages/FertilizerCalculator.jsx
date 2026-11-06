import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaCalculator, FaSeedling, FaCalendarAlt, FaRupeeSign, FaInfoCircle } from 'react-icons/fa';
import WhatsAppShareButton from '../components/WhatsAppShareButton';

// ICAR Crop Fertilizer & Seed Rate Standards (per Acre)
const CROP_PROFILES = {
  wheat: {
    name: 'Wheat (Gehun)',
    hindiName: 'गेहूं',
    gujaratiName: 'ઘઉં',
    icon: '🌾',
    seedRateKgPerAcre: 40,
    ureaBags: 2.2, // 45kg bags
    dapBags: 1.0,  // 50kg bags
    mopBags: 0.5,  // 50kg bags
    micronutrient: 'Zinc Sulphate (21%) @ 10 kg/acre at basal',
    schedule: [
      { stage: 'Basal (At Sowing)', split: 'Full DAP + Full MOP + 1/3rd Urea', tip: 'Mix well with topsoil before seed drilling' },
      { stage: '1st Top Dressing (CRI stage / 21-25 Days)', split: '1/3rd Urea with 1st irrigation', tip: 'Essential for vigorous tillering' },
      { stage: '2nd Top Dressing (Booting / 45-55 Days)', split: 'Remaining 1/3rd Urea', tip: 'Ensure soil has adequate moisture' }
    ]
  },
  rice: {
    name: 'Paddy / Rice (Dhan)',
    hindiName: 'धान (चावल)',
    gujaratiName: 'ડાંગર (ચોખા)',
    icon: '🍚',
    seedRateKgPerAcre: 15,
    ureaBags: 2.6,
    dapBags: 1.2,
    mopBags: 0.8,
    micronutrient: 'Zinc Sulphate @ 10 kg/acre (prevents Khaira disease)',
    schedule: [
      { stage: 'Basal (Final puddling)', split: 'Full DAP + 50% MOP + 1/3rd Urea', tip: 'Apply just before transplanting' },
      { stage: 'Active Tillering (20-25 DAT)', split: '1/3rd Urea', tip: 'Top dress in shallow standing water' },
      { stage: 'Panicle Initiation (45-50 DAT)', split: 'Remaining Urea + 50% MOP', tip: 'Promotes grain weight and reduces unfilled spikelets' }
    ]
  },
  cotton: {
    name: 'Bt Cotton (Kapas)',
    hindiName: 'कपास',
    gujaratiName: 'કપાસ (કપાસિયા)',
    icon: '☁️',
    seedRateKgPerAcre: 1.5, // Bt Cotton packets
    ureaBags: 3.2,
    dapBags: 1.5,
    mopBags: 1.2,
    micronutrient: 'Magnesium Sulphate @ 10 kg + Boron spray at square formation',
    schedule: [
      { stage: 'Basal / Sowing', split: 'Full DAP + 1/3rd MOP', tip: 'Place 5cm away and 5cm below seed depth' },
      { stage: 'Squaring Stage (30-40 DAS)', split: '1/2 Urea + 1/3rd MOP', tip: 'Supports rapid vegetative frame and bud growth' },
      { stage: 'Peak Boll Formation (65-75 DAS)', split: 'Remaining Urea + Remaining MOP', tip: 'Reduces boll shedding and increases lint weight' }
    ]
  },
  sugarcane: {
    name: 'Sugarcane (Ganna)',
    hindiName: 'गन्ना',
    gujaratiName: 'શેરડી',
    icon: '🎋',
    seedRateKgPerAcre: 3000, // 3-bud setts (approx 30 quintals)
    ureaBags: 5.5,
    dapBags: 2.5,
    mopBags: 2.0,
    micronutrient: 'Ferrous Sulphate 10 kg + Zinc 10 kg for ratoon / adsali',
    schedule: [
      { stage: 'Basal (Planting)', split: 'Full DAP + 1/3rd MOP + 1/4th Urea', tip: 'Apply in furrows before placing sets' },
      { stage: 'Tillering (45-60 DAP)', split: '1/4th Urea', tip: 'Followed by light earthing up and irrigation' },
      { stage: 'Grand Growth (90-110 DAP)', split: '1/2 Urea + Remaining MOP', tip: 'Final earthing up to prevent crop lodging' }
    ]
  },
  groundnut: {
    name: 'Groundnut (Mungfali)',
    hindiName: 'मूंगफली',
    gujaratiName: 'મગફળી',
    icon: '🥜',
    seedRateKgPerAcre: 45,
    ureaBags: 0.8,
    dapBags: 1.0,
    mopBags: 0.6,
    micronutrient: 'Gypsum @ 150 kg/acre at flowering (crucial for pod filling)',
    schedule: [
      { stage: 'Basal (Sowing)', split: 'Full DAP + Full MOP + 1/2 Urea', tip: 'Groundnut is a legume and fixes own nitrogen' },
      { stage: 'Flowering & Pegging (30-35 DAS)', split: 'Remaining Urea + Gypsum broadcast', tip: 'Avoid disturbing soil after pegging starts' }
    ]
  },
  tomato: {
    name: 'Tomato (Tamatar)',
    hindiName: 'टमाटर',
    gujaratiName: 'ટામેટાં',
    icon: '🍅',
    seedRateKgPerAcre: 0.15, // 150 grams hybrid seed
    ureaBags: 2.5,
    dapBags: 1.8,
    mopBags: 1.5,
    micronutrient: 'Calcium Nitrate foliar spray + Boron during fruit set',
    schedule: [
      { stage: 'Basal (Bed Preparation)', split: 'Full DAP + 50% MOP + 1/3rd Urea', tip: 'Add well-rotted FYM/compost 5 tonnes/acre' },
      { stage: 'Vegetative Growth (25 DAT)', split: '1/3rd Urea', tip: 'Staking/trellising recommended' },
      { stage: 'Fruit Setting (50-60 DAT)', split: 'Remaining Urea + 50% MOP', tip: 'Boosts tomato size, firmness, and gloss' }
    ]
  },
  potato: {
    name: 'Potato (Alu)',
    hindiName: 'आलू',
    gujaratiName: 'બટાકા',
    icon: '🥔',
    seedRateKgPerAcre: 800, // Seed tubers in kg
    ureaBags: 3.5,
    dapBags: 2.2,
    mopBags: 2.5,
    micronutrient: 'Sulphur 90% @ 10 kg/acre for starch and skin finish',
    schedule: [
      { stage: 'Basal (Furrow Sowing)', split: 'Full DAP + 50% MOP + 1/2 Urea', tip: 'Apply fertilizer in bands along furrows' },
      { stage: 'Earthing Up (25-30 DAS)', split: 'Remaining Urea + 50% MOP', tip: 'Cover tubers completely to prevent greening' }
    ]
  }
};

// Subsidized retail bag rates (INR approx)
const BAG_PRICES = {
  urea: 268,   // 45kg neem coated urea bag
  dap: 1350,   // 50kg DAP bag
  mop: 1650    // 50kg MOP (Muriate of Potash) bag
};

export default function FertilizerCalculator() {
  const { language } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [landArea, setLandArea] = useState(2);
  const [areaUnit, setAreaUnit] = useState('Acre'); // 'Acre', 'Bigha', 'Hectare'

  // Convert all area units into effective Acres for agronomy math
  // 1 Gujarat Bigha = ~0.606 Acre (or 1 Acre = ~1.65 Bigha)
  // 1 Hectare = 2.471 Acres
  const effectiveAcres = useMemo(() => {
    const val = Number(landArea) || 1;
    if (areaUnit === 'Bigha') {
      return val * 0.606;
    }
    if (areaUnit === 'Hectare') {
      return val * 2.471;
    }
    return val;
  }, [landArea, areaUnit]);

  const crop = CROP_PROFILES[selectedCrop] || CROP_PROFILES.wheat;

  // Compute total bags needed
  const ureaBagsTotal = (crop.ureaBags * effectiveAcres).toFixed(1);
  const dapBagsTotal = (crop.dapBags * effectiveAcres).toFixed(1);
  const mopBagsTotal = (crop.mopBags * effectiveAcres).toFixed(1);

  // Seed needed
  const totalSeedKg = (crop.seedRateKgPerAcre * effectiveAcres).toFixed(1);

  // Total estimated fertilizer expenditure
  const estCost = Math.round(
    parseFloat(ureaBagsTotal) * BAG_PRICES.urea +
    parseFloat(dapBagsTotal) * BAG_PRICES.dap +
    parseFloat(mopBagsTotal) * BAG_PRICES.mop
  );

  const getCropTitle = (c) => {
    if (language === 'gu') return c.gujaratiName;
    if (language === 'hi') return c.hindiName;
    return c.name;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header Banner Box */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 rounded-3xl p-7 sm:p-9 text-white shadow-premium mb-8 relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold text-harvest-300 border border-white/20 mb-3">
            <FaCalculator className="text-harvest-400" />
            <span>ICAR-Recommended Dosage Calculator</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-3">
            {language === 'gu'
              ? 'સ્માર્ટ ખાતર અને બિયારણ ગણક'
              : language === 'hi'
              ? 'स्मार्ट उर्वरक एवं बीज दर कैलकुलेटर'
              : 'Precision Fertilizer & Seed Rate Calculator'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-medium">
            {language === 'gu'
              ? 'તમારી જમીન (એકર / વીઘા) અનુસાર યુરિયા, ડીએપી, પોટાશની ચોક્કસ થેલીઓ અને આપવાનો સમયગાળો જાણો.'
              : language === 'hi'
              ? 'अपनी ज़मीन (एकड़ / बीघा) के अनुसार यूरिया, डीएपी, पोटाश की सटीक बोरियां और देने का समय जानें।'
              : 'Calculate exact commercial fertilizer bags (Urea, DAP, MOP), basal split schedules, and seed requirements.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Select Crop & Area */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-surface-200 shadow-md space-y-6">
          <div>
            <label className="block text-sm font-bold text-surface-900 mb-3">
              {language === 'gu' ? '૧. પાક પસંદ કરો' : language === 'hi' ? '1. फसल चुनें' : '1. Select Target Crop'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(CROP_PROFILES).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCrop(key)}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center transition-all ${
                    selectedCrop === key
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white border-surface-200 text-surface-700 hover:border-emerald-400 shadow-sm'
                  }`}
                >
                  <span className="text-2xl mb-1">{c.icon}</span>
                  <span className="text-xs font-bold text-center leading-tight">
                    {getCropTitle(c)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Land Area Input */}
          <div className="pt-4 border-t border-surface-200">
            <label className="block text-sm font-bold text-surface-900 mb-2">
              {language === 'gu' ? '૨. જમીનનું ક્ષેત્રફળ' : language === 'hi' ? '2. खेत का क्षेत्रफल' : '2. Farm Plot Area'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={landArea}
                  onChange={(e) => setLandArea(Math.max(0.1, Number(e.target.value)))}
                  className="w-full py-3 px-4 rounded-xl bg-white border border-surface-300 text-surface-900 text-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                />
              </div>
              <div className="sm:col-span-5 grid grid-cols-3 gap-1">
                {['Acre', 'Bigha', 'Hectare'].map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setAreaUnit(unit)}
                    className={`py-3 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                      areaUnit === unit
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-surface-700 border-surface-200 hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    {unit === 'Acre' ? 'એકર / Acre' : unit === 'Bigha' ? 'વીઘા' : 'હેક્ટર'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-surface-500 font-medium">
              {language === 'gu'
                ? `ગણતરી માટે અસરકારક એકર: ~${effectiveAcres.toFixed(2)} એકર`
                : language === 'hi'
                ? `गणना हेतु प्रभावी एकड़: ~${effectiveAcres.toFixed(2)} एकड़`
                : `Calculated Effective Area: ~${effectiveAcres.toFixed(2)} Acres`}
            </div>
          </div>

          {/* Subsidized Price Reference Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <FaInfoCircle className="text-amber-600" />
              <span>Govt. Subsidized Fertilizer Benchmarks (2026):</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] text-amber-800 font-semibold">
              <span>Urea: ₹268 / 45kg</span>
              <span>DAP: ₹1,350 / 50kg</span>
              <span>MOP: ₹1,650 / 50kg</span>
            </div>
          </div>
        </div>

        {/* Right Area: Calculated Results & Fertilizer Bags */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Result Summary Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-7 rounded-3xl shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/20">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-200 font-bold">
                  {language === 'gu' ? 'ખાતર ભલામણ પત્રક' : language === 'hi' ? 'उर्वरक सिफारिश चार्ट' : 'Dosage Summary'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2 mt-1">
                  <span>{crop.icon}</span>
                  <span>{getCropTitle(crop)}</span>
                  <span className="text-sm font-normal text-emerald-100">
                    ({landArea} {areaUnit})
                  </span>
                </h2>
              </div>

              <WhatsAppShareButton
                title={`Smart Krushi Fertilizer Schedule for ${getCropTitle(crop)} (${landArea} ${areaUnit})`}
                text={`Fertilizer requirement: Urea: ${ureaBagsTotal} bags (45kg), DAP: ${dapBagsTotal} bags, MOP: ${mopBagsTotal} bags. Seed: ${totalSeedKg} kg. Est cost: ₹${estCost}. Generated on Smart Krushi Bazar.`}
                className="bg-white/20 hover:bg-white/30 !text-white text-xs border border-white/30"
              />
            </div>

            {/* Bags Needed Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {/* Urea */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-xs text-emerald-100 font-semibold">Urea (45 kg)</div>
                <div className="text-3xl font-black my-1">{ureaBagsTotal}</div>
                <div className="text-[11px] text-emerald-200">Bags (~{(ureaBagsTotal * 45).toFixed(0)} kg)</div>
              </div>

              {/* DAP */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-xs text-emerald-100 font-semibold">DAP (50 kg)</div>
                <div className="text-3xl font-black my-1">{dapBagsTotal}</div>
                <div className="text-[11px] text-emerald-200">Bags (~{(dapBagsTotal * 50).toFixed(0)} kg)</div>
              </div>

              {/* MOP */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-xs text-emerald-100 font-semibold">MOP / Potash (50 kg)</div>
                <div className="text-3xl font-black my-1">{mopBagsTotal}</div>
                <div className="text-[11px] text-emerald-200">Bags (~{(mopBagsTotal * 50).toFixed(0)} kg)</div>
              </div>
            </div>

            {/* Seed & Cost Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                  <FaSeedling />
                </div>
                <div>
                  <div className="text-xs text-emerald-200 font-medium">
                    {language === 'gu' ? 'જરૂરી બિયારણ' : language === 'hi' ? 'आवश्यक बीज दर' : 'Recommended Seed Quantity'}
                  </div>
                  <div className="text-lg font-bold">
                    {totalSeedKg} {selectedCrop === 'sugarcane' ? 'Quintals Setts' : selectedCrop === 'cotton' ? 'Packets' : 'kg'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                  <FaRupeeSign />
                </div>
                <div>
                  <div className="text-xs text-emerald-200 font-medium">
                    {language === 'gu' ? 'અંદાજિત ખાતર ખર્ચ' : language === 'hi' ? 'अनुमानित उर्वरक लागत' : 'Est. Subsidized Fertilizer Cost'}
                  </div>
                  <div className="text-lg font-bold">
                    ₹{estCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fertilizer Application Schedule */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-surface-200 shadow-md">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2 mb-4">
              <FaCalendarAlt className="text-emerald-600" />
              <span>
                {language === 'gu' ? 'ખાતર આપવાનો તબક્કાવાર સમયગાળો' : language === 'hi' ? 'उर्वरक देने की चरणबद्ध समय-सारणी' : 'Split Application Timeline & Agronomy Guide'}
              </span>
            </h3>

            <div className="space-y-4">
              {crop.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-50/80 border border-surface-200/80 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-surface-900 text-sm">
                        {item.stage}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                        {item.split}
                      </span>
                    </div>
                    <p className="text-xs text-surface-600 mt-1">
                      {item.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Micronutrient Advisory Box */}
            <div className="mt-5 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-3">
              <FaInfoCircle className="text-teal-600 text-lg shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5">
                  {language === 'gu' ? 'સૂક્ષ્મ પોષકતત્વોની ભલામણ:' : language === 'hi' ? 'सूक्ष्म पोषक तत्व सलाह:' : 'Micronutrient & Soil Health Recommendation:'}
                </div>
                <div>{crop.micronutrient}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
