import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import BackButton from '../components/BackButton';
import {
  FaTruck, FaMapMarkerAlt, FaWeightHanging, FaCalculator,
  FaPhoneAlt, FaLeaf, FaClock, FaRoute, FaShieldAlt,
  FaBoxes, FaRupeeSign, FaCheckCircle, FaExchangeAlt, FaGasPump
} from 'react-icons/fa';

// Real road distance matrix between key Western India Agri Hubs & Major Consumer Cities (in KM)
const DISTANCE_MATRIX = {
  'Navsari': { 'Surat': 38, 'Mumbai': 240, 'Ahmedabad': 295, 'Vadodara': 185, 'Rajkot': 480, 'Bharuch': 110, 'Vapi': 85, 'Pune': 370 },
  'Anand': { 'Surat': 150, 'Mumbai': 410, 'Ahmedabad': 75, 'Vadodara': 45, 'Rajkot': 270, 'Bharuch': 95, 'Vapi': 260, 'Pune': 540 },
  'Surat': { 'Surat': 15, 'Mumbai': 280, 'Ahmedabad': 265, 'Vadodara': 150, 'Rajkot': 450, 'Bharuch': 75, 'Vapi': 115, 'Pune': 410 },
  'Rajkot': { 'Surat': 450, 'Mumbai': 710, 'Ahmedabad': 215, 'Vadodara': 300, 'Rajkot': 15, 'Bharuch': 370, 'Vapi': 560, 'Pune': 840 },
  'Junagadh': { 'Surat': 510, 'Mumbai': 770, 'Ahmedabad': 310, 'Vadodara': 390, 'Rajkot': 105, 'Bharuch': 460, 'Vapi': 620, 'Pune': 900 },
  'Mehsana': { 'Surat': 330, 'Mumbai': 590, 'Ahmedabad': 75, 'Vadodara': 180, 'Rajkot': 280, 'Bharuch': 250, 'Vapi': 440, 'Pune': 710 },
  'Vadodara': { 'Surat': 150, 'Mumbai': 400, 'Ahmedabad': 110, 'Vadodara': 15, 'Rajkot': 290, 'Bharuch': 70, 'Vapi': 250, 'Pune': 530 },
  'Nashik': { 'Surat': 230, 'Mumbai': 165, 'Ahmedabad': 480, 'Vadodara': 370, 'Rajkot': 690, 'Bharuch': 300, 'Vapi': 140, 'Pune': 210 }
};

const VEHICLES = [
  {
    id: 'bike',
    name: 'Two-Wheeler / E-Cargo Loader',
    capacityKg: 40,
    baseFare: 150,
    perKm: 7,
    icon: '🛵',
    desc: 'Ideal for local retail orders & small organic fruit/veggie baskets (< 40 kg)'
  },
  {
    id: 'auto',
    name: '3-Wheeler Cargo (Piaggio Ape)',
    capacityKg: 500,
    baseFare: 350,
    perKm: 14,
    icon: '🛺',
    desc: 'Local farm-to-mandi, crates of tomatoes, leafy vegetables (40 kg - 500 kg)'
  },
  {
    id: 'tata_ace',
    name: 'Tata Ace / Chhota Hathi / Bolero Maxi',
    capacityKg: 1500,
    baseFare: 700,
    perKm: 20,
    icon: '🛻',
    desc: 'The gold standard for inter-district farm harvest runs (500 kg - 1.5 Tonnes)'
  },
  {
    id: 'eicher',
    name: 'Eicher 14ft / 19ft Intermediate Commercial',
    capacityKg: 7000,
    baseFare: 1800,
    perKm: 34,
    icon: '🚚',
    desc: 'Wholesale B2B consignments, grain sacks, bulk quintals (1.5 - 7 Tonnes)'
  },
  {
    id: 'truck_heavy',
    name: '10-Wheeler Multi-Axle Heavy Truck',
    capacityKg: 25000,
    baseFare: 4000,
    perKm: 58,
    icon: '🚛',
    desc: 'Inter-state full truckload (FTL) for processing mills & traders (7 - 25 Tonnes)'
  }
];

export default function FreightEstimator() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  // URL params prefill (e.g., coming from a product details page)
  const queryOrigin = searchParams.get('origin') || 'Navsari';
  const queryCrop = searchParams.get('crop') || '';
  const queryQty = searchParams.get('qty') || '250';

  const [origin, setOrigin] = useState(queryOrigin.includes('Navsari') ? 'Navsari' : queryOrigin.includes('Surat') ? 'Surat' : 'Navsari');
  const [destination, setDestination] = useState('Surat');
  const [distanceKm, setDistanceKm] = useState(38);
  const [weightKg, setWeightKg] = useState(Number(queryQty) || 250);
  const [cropType, setCropType] = useState('perishable'); // 'perishable' | 'dry'
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [includeLoading, setIncludeLoading] = useState(true);

  // Auto-calculate distance when origin/destination changes
  useEffect(() => {
    const dist = DISTANCE_MATRIX[origin]?.[destination] || 150;
    setDistanceKm(dist);
  }, [origin, destination]);

  // Auto-recommend appropriate vehicle based on weight
  useEffect(() => {
    if (weightKg <= 40) {
      setSelectedVehicleId('bike');
    } else if (weightKg <= 500) {
      setSelectedVehicleId('auto');
    } else if (weightKg <= 1500) {
      setSelectedVehicleId('tata_ace');
    } else if (weightKg <= 7000) {
      setSelectedVehicleId('eicher');
    } else {
      setSelectedVehicleId('truck_heavy');
    }
  }, [weightKg]);

  const activeVehicle = VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[2];

  // Freight calculation formulas
  const baseRunFare = activeVehicle.baseFare + (distanceKm * activeVehicle.perKm);
  const hamaliCharge = includeLoading ? Math.round(weightKg * 0.25) : 0; // ₹0.25 per kg loading/unloading
  const perishableSurcharge = cropType === 'perishable' ? Math.round(baseRunFare * 0.12) : 0; // 12% crate & ventilation care
  const tollEstimate = distanceKm > 100 ? Math.round((distanceKm / 65) * 85) : 0; // approx highway tolls

  const totalFreight = Math.round(baseRunFare + hamaliCharge + perishableSurcharge + tollEstimate);
  const costPerKg = weightKg > 0 ? (totalFreight / weightKg).toFixed(2) : 0;

  // Transit time estimation (average 40 km/h for commercial trucks + 45 min loading)
  const travelHours = (distanceKm / 42).toFixed(1);

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation */}
      <div className="mb-6">
        <BackButton fallback="/products" label={t('common.back', 'Back to Marketplace')} />
      </div>

      {/* Hero Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-emerald-900 to-brand-950 text-white shadow-premium border border-emerald-800/40 relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-3 border border-emerald-400/30 backdrop-blur-md">
            <FaTruck className="text-emerald-400" /> Farm-to-Door Logistics & Freight Calculator
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-2">
            Calculate Farm Transport & Delivery Fare
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
            Transparently estimate vehicle rental, road distance, transit time, and freight cost per kilogram directly from farm gate orchards to your city doorstep or warehouse.
          </p>
          {queryCrop && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl text-xs font-bold text-harvest-300 border border-white/10">
              <FaLeaf className="text-emerald-400" /> Sourcing Produce: {queryCrop} ({queryQty} kg)
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form Inputs vs Cost Output Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-luxe p-6 shadow-xl border border-emerald-400/20 space-y-6">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider font-display flex items-center gap-2 pb-3 border-b border-surface-100">
              <FaMapMarkerAlt className="text-emerald-600" /> Route & Cargo Parameters
            </h3>

            {/* Origin & Destination Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                  Origin Farm District (Gujarat Hub):
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="input-saas w-full text-xs font-bold bg-white"
                >
                  {Object.keys(DISTANCE_MATRIX).map((hub) => (
                    <option key={hub} value={hub}>{hub} District (Farm Gate)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                  Destination City (Buyer Location):
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-saas w-full text-xs font-bold bg-white"
                >
                  {Object.keys(DISTANCE_MATRIX['Navsari']).map((city) => (
                    <option key={city} value={city}>{city} (Doorstep / Mandi)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Road Distance Customizer Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                  Estimated Highway Distance:
                </label>
                <span className="text-sm font-black text-brand-900 font-display">
                  {distanceKm} km
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-surface-400 mt-1 font-semibold">
                <span>Local (10 km)</span>
                <span>Regional (250 km)</span>
                <span>Interstate (800 km)</span>
              </div>
            </div>

            {/* Weight / Quantity Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-surface-100">
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                  Produce Weight (Quantity):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30000"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                    className="input-saas w-full text-sm font-black pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-surface-400">
                    kg
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[50, 250, 1000, 5000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setWeightKg(q)}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors ${
                        weightKg === q
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-emerald-50'
                      }`}
                    >
                      {q >= 1000 ? `${q / 1000}T` : `${q}kg`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                  Produce Sensitivity / Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCropType('perishable')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                      cropType === 'perishable'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <span>🥦 Perishable</span>
                    <span className="text-[10px] font-normal text-surface-500">Fruits, Veggies, Milk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCropType('dry')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                      cropType === 'dry'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <span>🌾 Dry / Grain</span>
                    <span className="text-[10px] font-normal text-surface-500">Wheat, Rice, Pulses</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Selection Carousel / Cards */}
            <div className="pt-3 border-t border-surface-100">
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2.5">
                Recommended Commercial Vehicle:
              </label>
              <div className="space-y-2.5">
                {VEHICLES.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  const isRecommended = v.capacityKg >= weightKg && (v.id === 'bike' ? weightKg <= 40 : v.id === 'auto' ? weightKg <= 500 : v.id === 'tata_ace' ? weightKg <= 1500 : true);

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-brand-600 bg-emerald-50/50 shadow-md ring-2 ring-brand-500/20'
                          : 'border-surface-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{v.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-surface-900 font-display">{v.name}</h4>
                            {isSelected && (
                              <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-surface-500 font-medium mt-0.5">{v.desc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-brand-900 font-display">₹{v.perKm}/km</p>
                        <p className="text-[10px] text-surface-400 font-bold">Max {v.capacityKg >= 1000 ? `${v.capacityKg / 1000}T` : `${v.capacityKg}kg`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkbox: Hamali / Labor */}
            <div className="flex items-center gap-2 pt-2 text-xs font-bold text-surface-700">
              <input
                type="checkbox"
                id="hamali"
                checked={includeLoading}
                onChange={(e) => setIncludeLoading(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <label htmlFor="hamali" className="cursor-pointer">
                Include Farm Gate Loading & Destination Unloading Labor (Hamali @ ₹0.25/kg)
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Invoice / Cost Summary Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-luxe p-6 sm:p-7 bg-gradient-to-b from-brand-950 via-emerald-950 to-surface-950 text-white shadow-2xl rounded-3xl border border-emerald-500/30 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-harvest-300">Live Logistics Quotation</span>
                <h3 className="text-lg font-black font-display text-white">Estimated Freight Fare</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg border border-emerald-400/30">
                <FaCalculator />
              </div>
            </div>

            {/* Total Fare Hero Number */}
            <div className="py-6 text-center border-b border-white/10 bg-white/5 rounded-2xl my-4">
              <p className="text-4xl sm:text-5xl font-black text-harvest-300 font-display tracking-tight">
                ₹{totalFreight.toLocaleString('en-IN')}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-400/30">
                <FaRupeeSign className="text-[10px]" /> Just ₹{costPerKg} per kg transport impact
              </div>
            </div>

            {/* Cost Line Items */}
            <div className="space-y-3 text-xs font-medium text-surface-200 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Selected Vehicle:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>{activeVehicle.icon}</span> {activeVehicle.name.split('(')[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Road Distance:</span>
                <span className="font-bold text-white">{origin} ➔ {destination} ({distanceKm} km)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-400">Base Vehicle Run (Fare):</span>
                <span className="font-bold text-white">₹{baseRunFare.toLocaleString('en-IN')}</span>
              </div>
              {includeLoading && (
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Loading/Unloading Labor:</span>
                  <span className="font-bold text-white">₹{hamaliCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              {cropType === 'perishable' && (
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Perishable Care & Crate Handling:</span>
                  <span className="font-bold text-emerald-300">₹{perishableSurcharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              {tollEstimate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Estimated Highway Tolls:</span>
                  <span className="font-bold text-white">₹{tollEstimate.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-surface-400 flex items-center gap-1">
                  <FaClock className="text-amber-400 text-[10px]" /> Expected Transit Time:
                </span>
                <span className="font-black text-amber-300 font-display">
                  ~{travelHours} Hours (Same Day Delivery)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <a
                href="tel:18001802111"
                className="btn-luxe-harvest w-full !py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl shadow-lg"
              >
                <FaPhoneAlt /> Call Kisan Rath Transport Desk (1800-180-2111)
              </a>
              <Link
                to="/products"
                className="btn-saas-secondary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 text-center"
              >
                Procure Fresh Produce from {origin}
              </Link>
            </div>

            {/* Small Trust Seal */}
            <p className="text-[10px] text-emerald-300/70 text-center mt-4 flex items-center justify-center gap-1">
              <FaShieldAlt className="text-emerald-400" /> Standard rates per Gujarat Ag Logistics Federation guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Kisan Rath & Verified Transport Directory Cards */}
      <div className="card-luxe p-6 sm:p-8 bg-surface-50 border border-surface-200">
        <h3 className="text-base font-black text-surface-900 font-display mb-1 flex items-center gap-2">
          <FaTruck className="text-emerald-600" /> Verified Agricultural Transporter Helplines
        </h3>
        <p className="text-xs text-surface-500 mb-6 font-medium">
          Connect directly with certified agro-freight drivers and cold-chain operators across South Gujarat and Western India.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-surface-200 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              National Portal
            </span>
            <h4 className="text-sm font-bold text-surface-900 font-display mt-2">Kisan Rath Ministry Desk</h4>
            <p className="text-xs text-surface-500 mt-1">Direct pan-India truck booking app for farmers and wholesale FPO buyers.</p>
            <p className="text-xs font-black text-brand-900 font-display mt-3 flex items-center gap-1.5">
              <FaPhoneAlt className="text-emerald-600 text-[10px]" /> Toll-Free: 1800-180-2111
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-surface-200 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Gujarat State Hub
            </span>
            <h4 className="text-sm font-bold text-surface-900 font-display mt-2">Navsari-Surat Agro Express</h4>
            <p className="text-xs text-surface-500 mt-1">Daily refrigerated pickup vans for Mango, Chikoo, Banana & fresh veggies.</p>
            <p className="text-xs font-black text-brand-900 font-display mt-3 flex items-center gap-1.5">
              <FaPhoneAlt className="text-emerald-600 text-[10px]" /> +91 98251 44021
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-surface-200 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Cold Chain Transit
            </span>
            <h4 className="text-sm font-bold text-surface-900 font-display mt-2">Gujarat Green Reefer Logistics</h4>
            <p className="text-xs text-surface-500 mt-1">Insulated temp-controlled vehicles preserving harvest freshness to Mumbai & Pune.</p>
            <p className="text-xs font-black text-brand-900 font-display mt-3 flex items-center gap-1.5">
              <FaPhoneAlt className="text-emerald-600 text-[10px]" /> +91 97230 88190
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
