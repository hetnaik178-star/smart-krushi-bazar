import { useEffect, useState } from 'react';
import { getFarmerAnalytics } from '../../services/analyticsService';
import SalesChart from '../../components/SalesChart';
import BackButton from '../../components/BackButton';
import { FaChartLine, FaRupeeSign, FaShoppingBag, FaTrophy, FaLeaf, FaCalendarAlt, FaChartPie } from 'react-icons/fa';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const finalValue = parseInt(value?.toString().replace(/,/g, ''), 10) || 0;

    if (finalValue === 0) {
      setDisplayValue(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * finalValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(finalValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarmerAnalytics()
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-surface-500 font-bold text-xs animate-pulse">Loading sales analytics...</div>;
  if (!analytics) return <div className="text-center py-16 text-red-500 font-bold text-xs">Failed to load analytics data.</div>;

  const totalSales = analytics.totalSales || 0;
  const totalOrders = analytics.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  
  let bestMonthStr = "N/A";
  if (analytics.monthlySales && analytics.monthlySales.length > 0) {
    const bestMonth = [...analytics.monthlySales].sort((a, b) => b.total - a.total)[0];
    if (bestMonth && bestMonth.total > 0) {
      bestMonthStr = bestMonth._id || "N/A";
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-fade-in">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="bg-gradient-to-br from-surface-900 via-brand-900 to-brand-800 rounded-3xl p-8 mb-8 text-white shadow-premium animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-pulse"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/20 text-xs font-bold mb-3 backdrop-blur-sm">
            <FaChartLine className="text-emerald-400" /> Financial Intelligence
          </div>
          <h1 className="text-3xl font-black font-display mb-2">
            Farm Revenue & Sales Analytics
          </h1>
          <p className="text-emerald-100 font-medium max-w-2xl text-sm">
            Dive deep into your real-time revenue performance, monthly growth trends, and discover your top-selling farm produce to optimize future harvests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-saas p-6 border-l-4 border-l-brand-600 shadow-premium animate-slide-up stagger-1 relative overflow-hidden group">
          <FaRupeeSign className="absolute -right-4 -bottom-4 text-6xl text-brand-50 opacity-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500">Total Settled Revenue</p>
          <p className="text-3xl font-black text-brand-800 font-display mt-2 relative z-10">
            ₹<AnimatedNumber value={totalSales} />
          </p>
        </div>
        
        <div className="card-saas p-6 border-l-4 border-l-blue-600 shadow-premium animate-slide-up stagger-2 relative overflow-hidden group">
          <FaShoppingBag className="absolute -right-4 -bottom-4 text-6xl text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500">Total Dispatched Orders</p>
          <p className="text-3xl font-black text-blue-800 font-display mt-2 relative z-10">
            <AnimatedNumber value={totalOrders} />
          </p>
        </div>

        <div className="card-saas p-6 border-l-4 border-l-amber-500 shadow-premium animate-slide-up stagger-3 relative overflow-hidden group">
          <FaChartPie className="absolute -right-4 -bottom-4 text-6xl text-amber-50 opacity-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500">Avg. Order Value</p>
          <p className="text-3xl font-black text-amber-600 font-display mt-2 relative z-10">
            ₹<AnimatedNumber value={avgOrderValue} />
          </p>
        </div>

        <div className="card-saas p-6 border-l-4 border-l-purple-500 shadow-premium animate-slide-up stagger-4 relative overflow-hidden group">
          <FaCalendarAlt className="absolute -right-4 -bottom-4 text-6xl text-purple-50 opacity-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500">Best Performing Month</p>
          <p className="text-3xl font-black text-purple-700 font-display mt-2 relative z-10 truncate">
            {bestMonthStr}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-slide-up stagger-5">
          <div className="bg-white rounded-3xl p-1 shadow-premium border border-surface-100 h-full">
            <SalesChart monthlySales={analytics.monthlySales} />
          </div>
        </div>

        <div className="card-saas p-6 shadow-premium bg-gradient-to-b from-white to-surface-50 animate-slide-up stagger-6 border border-surface-200">
          <div className="w-12 h-12 bg-harvest-100 rounded-2xl flex items-center justify-center text-harvest-600 mb-4 shadow-sm">
            <FaTrophy className="text-xl" />
          </div>
          <h2 className="font-black text-surface-900 text-lg tracking-tight mb-6 font-display">
            Top Performing Produce
          </h2>
          
          {analytics.bestSelling && analytics.bestSelling.length > 0 ? (
            <ul className="space-y-4">
              {analytics.bestSelling.map((item, idx) => (
                <li key={idx} className={`flex justify-between items-center p-3 rounded-xl bg-white border border-surface-100 shadow-sm hover:border-brand-200 transition-colors group animate-fade-in-right stagger-${(idx % 8) + 1}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center font-black text-surface-500 text-xs group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                      #{idx + 1}
                    </div>
                    <span className="font-bold text-sm text-surface-900 font-display">{item._id}</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                    {item.totalQty} units
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <FaLeaf className="text-4xl text-surface-200 mx-auto mb-3" />
              <p className="text-sm text-surface-500 font-medium">No order history available yet to determine best sellers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
