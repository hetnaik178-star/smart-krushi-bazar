import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { FaTimes, FaChartLine, FaArrowUp, FaArrowDown, FaMinus, FaCalendarAlt, FaStore, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const MandiTrendModal = ({ commodity, market, onClose }) => {
  const { t } = useLanguage();
  const [days, setDays] = useState(7);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!commodity) return;
    setLoading(true);

    const fetchTrend = async () => {
      try {
        const url = `${API_URL}/mandi/trend?commodity=${encodeURIComponent(commodity)}&days=${days}${market ? `&market=${encodeURIComponent(market)}` : ''}`;
        const res = await axios.get(url);
        if (res.data?.success && res.data.data) {
          setTrendData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load Mandi trend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [commodity, days, market]);

  if (!commodity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-3xl card-luxe !bg-white/95 !p-0 shadow-2xl overflow-hidden border border-emerald-400/30 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-surface-200/80 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <FaChartLine className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-surface-900">
                  {commodity} {t('mandi.trendTitle', 'Price Trend History')}
                </h3>
                {trendData?.variety && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {trendData.variety}
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-500 flex items-center gap-1.5 mt-0.5">
                <FaStore className="text-emerald-600 text-[10px]" />
                <span>{trendData?.market || market || 'APMC Regional Mandi'}</span>
                <span>•</span>
                <span>₹ / {trendData?.unit || 'Quintal'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="Close Modal"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Controls & KPI Strip */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* 7 Days / 30 Days Switcher */}
            <div className="flex items-center p-1 bg-surface-100 rounded-2xl border border-surface-200">
              <button
                type="button"
                onClick={() => setDays(7)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === 7
                    ? 'bg-gradient-to-r from-brand-700 to-emerald-600 text-white shadow-md'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {t('mandi.days7', '7 Days')}
              </button>
              <button
                type="button"
                onClick={() => setDays(30)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === 30
                    ? 'bg-gradient-to-r from-brand-700 to-emerald-600 text-white shadow-md'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {t('mandi.days30', '30 Days')}
              </button>
            </div>

            {/* Quick Metrics */}
            {trendData && (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Current Modal Price */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                  <span className="text-[10px] text-emerald-600 uppercase block font-semibold">{t('mandi.current', 'Current')}</span>
                  <span className="text-sm font-black text-brand-900">₹{trendData.currentPrice}</span>
                </div>

                {/* Highest Price */}
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                  <span className="text-[10px] text-amber-600 uppercase block font-semibold">{t('mandi.highest', 'Highest')}</span>
                  <span className="text-sm font-black text-amber-800">₹{trendData.highestPrice}</span>
                </div>

                {/* Lowest Price */}
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold">
                  <span className="text-[10px] text-blue-600 uppercase block font-semibold">{t('mandi.lowest', 'Lowest')}</span>
                  <span className="text-sm font-black text-blue-800">₹{trendData.lowestPrice}</span>
                </div>

                {/* Trend Direction Badge */}
                <div className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-extrabold ${
                  trendData.trendDirection === 'up'
                    ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-400/30'
                    : trendData.trendDirection === 'down'
                    ? 'bg-red-500/15 text-red-800 border border-red-400/30'
                    : 'bg-surface-100 text-surface-800 border border-surface-200'
                }`}>
                  {trendData.trendDirection === 'up' && <FaArrowUp className="text-emerald-600" />}
                  {trendData.trendDirection === 'down' && <FaArrowDown className="text-red-600" />}
                  {trendData.trendDirection === 'stable' && <FaMinus className="text-surface-500" />}
                  <span>{trendData.percentChange}</span>
                </div>
              </div>
            )}
          </div>

          {/* Line Chart View */}
          <div className="h-64 sm:h-72 w-full pt-2">
            {loading ? (
              <div className="h-full w-full rounded-2xl bg-surface-100 skeleton-shimmer flex items-center justify-center text-xs text-surface-400 font-bold">
                Loading price curve...
              </div>
            ) : trendData?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="p-3 rounded-2xl bg-surface-900/95 text-white text-xs shadow-xl border border-emerald-500/30 backdrop-blur-md space-y-1">
                            <p className="text-[10px] font-bold text-emerald-300 uppercase">{label}</p>
                            <p className="text-sm font-extrabold text-white">Modal: ₹{item.price}</p>
                            <p className="text-[10px] text-surface-300">Min: ₹{item.minPrice} | Max: ₹{item.maxPrice}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#059669" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#priceGradient)" 
                    dot={{ stroke: '#047857', strokeWidth: 2, r: 3, fill: '#ffffff' }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2, fill: '#f59e0b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-surface-500">
                No historical trend data available for this commodity.
              </div>
            )}
          </div>

          {/* Footer Advisory Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-800">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-emerald-600 shrink-0 text-xs" />
              <span>Verified APMC wholesale market auctions recorded across Gujarat and Indian agricultural zones.</span>
            </div>
            <button
              onClick={onClose}
              className="btn-luxe-primary text-xs !py-1.5 !px-4"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandiTrendModal;
