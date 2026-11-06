import { useState, useEffect, useContext, useMemo } from 'react';
import { getMandiPrices, getMandiLocations } from '../services/mandiService';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import VoiceSearchButton from '../components/VoiceSearchButton';
import MandiTrendModal from '../components/MandiTrendModal';
import WhatsAppShareButton from '../components/WhatsAppShareButton';
import {
  FaChartLine,
  FaSearch,
  FaMapMarkerAlt,
  FaSync,
  FaStore,
  FaFilter,
  FaCalendarAlt,
  FaCoins,
  FaSeedling
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MandiPrices = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const [locationsData, setLocationsData] = useState({
    states: [],
    districtsByState: {},
    marketsByDistrict: {},
    commodities: [],
    varietiesByCommodity: {},
    dates: []
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [selectedCommodity, setSelectedCommodity] = useState('All Commodities');
  const [selectedVariety, setSelectedVariety] = useState('All Varieties');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modal_desc');

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendTarget, setTrendTarget] = useState(null);

  useEffect(() => {
    const initLocations = async () => {
      try {
        const locRes = await getMandiLocations();
        if (locRes.success && locRes.data) {
          setLocationsData(locRes.data);
          let initialDist = 'All Districts';
          let initialMarket = 'All Markets';

          if (user?.location) {
            const locLower = user.location.toLowerCase();
            if (locLower.includes('navsari')) {
              setSelectedState('Gujarat');
              initialDist = 'Navsari';
              initialMarket = 'Navsari';
            } else if (locLower.includes('gujarat')) {
              setSelectedState('Gujarat');
            } else if (locRes.data.states.length > 0) {
              setSelectedState(locRes.data.states[0]);
            }
          } else if (locRes.data.states.includes('Gujarat')) {
            setSelectedState('Gujarat');
            initialDist = 'Navsari';
            initialMarket = 'Navsari';
          } else if (locRes.data.states.length > 0) {
            setSelectedState(locRes.data.states[0]);
          }

          setSelectedDistrict(initialDist);
          setSelectedMarket(initialMarket);
        }
      } catch (err) {
        console.error('Failed to load Mandi filter locations:', err);
      }
    };
    initLocations();
  }, [user]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const query = {
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket,
        commodity: selectedCommodity,
        variety: selectedVariety,
        date: selectedDate,
        search: searchQuery,
        sort: sortBy
      };

      const res = await getMandiPrices(query);
      if (res.success && Array.isArray(res.data)) {
        setPrices(res.data);
      }
    } catch (err) {
      toast.error('Failed to update live Mandi rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState) {
      fetchPrices();
    }
  }, [
    selectedState,
    selectedDistrict,
    selectedMarket,
    selectedCommodity,
    selectedVariety,
    selectedDate,
    searchQuery,
    sortBy
  ]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedDistrict('All Districts');
    setSelectedMarket('All Markets');
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setSelectedDistrict(newDist);
    setSelectedMarket('All Markets');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrices();
  };

  const availableDistricts = useMemo(() => {
    if (!selectedState || !locationsData.districtsByState[selectedState]) return ['All Districts'];
    return ['All Districts', ...locationsData.districtsByState[selectedState]];
  }, [selectedState, locationsData]);

  const availableMarkets = useMemo(() => {
    if (!selectedState || !selectedDistrict || selectedDistrict === 'All Districts') return ['All Markets'];
    const key = `${selectedState}_${selectedDistrict}`;
    if (!locationsData.marketsByDistrict[key]) return ['All Markets'];
    return ['All Markets', ...locationsData.marketsByDistrict[key]];
  }, [selectedState, selectedDistrict, locationsData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <div className="mb-6">
        <BackButton fallback="/" label={t('nav.backToHome', 'Back to Home')} />
      </div>

      {/* Visual Agro Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-10 bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-900 shadow-premium border border-emerald-800/40 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-harvest-500/20 text-harvest-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-3 border border-harvest-400/30 backdrop-blur-md">
              <FaCoins className="text-harvest-400" /> {t('mandi.officialAgmarknet', 'Official AGMARKNET Government Data Feed')}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-2">
              {t('mandi.title', 'Live APMC Mandi Prices')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed">
              {t('mandi.subtitle', 'Real-time modal, minimum, and maximum market rates across APMC mandis in Gujarat and India.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppShareButton
              title={`Live APMC Mandi Rates (${selectedDistrict || selectedState || 'All India'})`}
              text={`Check current live government APMC agricultural market prices directly on Smart Krushi Bazar:`}
              className="!py-3 !px-4 text-xs font-bold"
            />
            <button
              onClick={fetchPrices}
              className="btn-saas-secondary text-xs !py-3 !px-5 shadow-sm font-bold flex items-center gap-2 bg-white/95"
            >
              <FaSync className={`${loading ? 'animate-spin' : ''} text-brand-700`} /> {t('mandi.refreshRates', 'Refresh Mandi Rates')}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar with Voice Search */}
      <div className="glass-card p-5 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder={t('mandi.searchPlaceholder', 'Search Mandi, commodity, or district...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-saas !pl-9 !pr-10 text-xs w-full"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearchButton
                onSpeechResult={(spokenText) => {
                  setSearchQuery(spokenText);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-saas sm:w-48 text-xs font-bold text-brand-900 bg-emerald-50/50 border-emerald-200"
            >
              <option value="modal_desc">Modal: High to Low</option>
              <option value="modal_asc">Modal: Low to High</option>
              <option value="commodity_asc">Crop: A to Z</option>
              <option value="date_desc">Latest Date</option>
            </select>
          </div>
        </div>

        {/* Cascading Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-surface-600 uppercase tracking-wider mb-1 font-display">State</label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="input-saas text-xs font-bold text-surface-900"
            >
              {locationsData.states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-surface-600 uppercase tracking-wider mb-1 font-display">District</label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="input-saas text-xs font-semibold text-surface-900"
            >
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-surface-600 uppercase tracking-wider mb-1 font-display">Market / Mandi</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="input-saas text-xs font-semibold text-surface-900"
            >
              {availableMarkets.map((mkt) => (
                <option key={mkt} value={mkt}>{mkt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-surface-600 uppercase tracking-wider mb-1 font-display">Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="input-saas text-xs font-semibold text-surface-900"
            >
              {['All Commodities', ...locationsData.commodities].map((cmd) => (
                <option key={cmd} value={cmd}>{cmd}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table (Desktop) */}
      <div className="hidden md:block card-luxe overflow-hidden shadow-2xl border border-emerald-500/20">
        <div className="overflow-x-auto scrollbar-saas">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-50 text-surface-600 uppercase text-[11px] font-bold tracking-wider border-b border-surface-200">
              <tr>
                <th className="px-5 py-4">{t('mandi.commodity', 'Commodity')}</th>
                <th className="px-5 py-4">{t('mandi.variety', 'Variety')}</th>
                <th className="px-5 py-4">{t('mandi.market', 'APMC Market')}</th>
                <th className="px-5 py-4">{t('mandi.districtState', 'District / State')}</th>
                <th className="px-4 py-4 text-right">{t('mandi.minPrice', 'Min (₹/Qtl)')}</th>
                <th className="px-5 py-4 text-right bg-emerald-50 text-brand-900 font-black">{t('mandi.modalPrice', 'Modal Rate (₹/Qtl)')}</th>
                <th className="px-4 py-4 text-right">{t('mandi.maxPrice', 'Max (₹/Qtl)')}</th>
                <th className="px-4 py-4 text-center">{t('mandi.trendChart', 'Trend Chart')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-medium">
              {prices.map((p, i) => (
                <tr key={i} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-5 py-4 font-bold text-surface-900 text-xs font-display">
                    {p.commodity || p.crop}
                  </td>
                  <td className="px-5 py-4 text-surface-600">{p.variety || 'Standard'}</td>
                  <td className="px-5 py-4 text-surface-800 font-bold">{p.market || p.mandi}</td>
                  <td className="px-5 py-4 text-surface-500">{p.district}, {p.state}</td>
                  <td className="px-4 py-4 text-right text-surface-500">₹{p.minPrice?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-black text-brand-800 bg-emerald-50/60 text-sm font-display">
                    ₹{p.modalPrice?.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-surface-500">₹{p.maxPrice?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setTrendTarget({ commodity: p.commodity || p.crop, market: p.market || p.mandi })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-800 border border-emerald-300/80 font-bold text-[11px] shadow-sm hover:scale-105 transition-all"
                      title="View Historical Price Trend"
                    >
                      <FaChartLine className="text-emerald-600 text-[10px]" />
                      <span>{t('mandi.viewTrend', 'Trend')}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {prices.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-14 text-center text-surface-400 font-medium">
                    No mandi price records found matching your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {prices.map((p, i) => (
          <div key={i} className="card-saas p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-sm text-surface-900 font-display">{p.commodity || p.crop}</h3>
                <p className="text-[11px] text-surface-500 flex items-center gap-1 mt-0.5 font-medium">
                  <FaMapMarkerAlt className="text-emerald-600" /> {p.market}, {p.district}
                </p>
              </div>
              <span className="text-[10px] bg-surface-100 text-surface-700 px-2.5 py-0.5 rounded-full font-bold border border-surface-200">
                {p.variety || 'Local'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-100 text-xs mb-3">
              <div className="text-center">
                <p className="text-[10px] text-surface-400 uppercase font-bold">Min</p>
                <p className="font-bold text-surface-700">₹{p.minPrice}</p>
              </div>
              <div className="text-center bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
                <p className="text-[10px] text-emerald-800 font-extrabold uppercase">Modal</p>
                <p className="font-black text-brand-900 text-sm font-display">₹{p.modalPrice}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-surface-400 uppercase font-bold">Max</p>
                <p className="font-bold text-surface-700">₹{p.maxPrice}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTrendTarget({ commodity: p.commodity || p.crop, market: p.market || p.mandi })}
              className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <FaChartLine className="text-emerald-600" />
              <span>{t('mandi.viewTrend', 'View Price Trend History')}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Historical Mandi Price Trend Modal */}
      {trendTarget && (
        <MandiTrendModal
          commodity={trendTarget.commodity}
          market={trendTarget.market}
          onClose={() => setTrendTarget(null)}
        />
      )}
    </div>
  );
};

export default MandiPrices;
