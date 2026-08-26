import { useEffect, useState } from 'react';
import { getFarmerAnalytics } from '../../services/analyticsService';
import SalesChart from '../../components/SalesChart';
import BackButton from '../../components/BackButton';
import { FaChartLine, FaRupeeSign, FaShoppingBag, FaTrophy, FaLeaf } from 'react-icons/fa';

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

  if (loading) return <div className="text-center py-16 text-surface-500 font-bold text-xs">Loading sales analytics...</div>;
  if (!analytics) return <div className="text-center py-16 text-surface-500 font-bold text-xs">Failed to load analytics data.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-fade-in">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
          <FaChartLine className="text-brand-600" /> Financial Intelligence
        </div>
        <h1 className="page-heading">
          Farm Revenue & Sales Analytics
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">Real-time revenue performance, monthly trends, and top selling farm produce.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card-saas p-6 border-l-4 border-l-brand-600 shadow-premium">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-400">Total Settled Revenue</p>
          <p className="text-3xl font-black text-brand-800 font-display mt-2">₹{analytics.totalSales?.toLocaleString()}</p>
        </div>
        <div className="card-saas p-6 border-l-4 border-l-blue-600 shadow-premium">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-surface-400">Total Dispatched Orders</p>
          <p className="text-3xl font-black text-surface-900 font-display mt-2">{analytics.totalOrders}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart monthlySales={analytics.monthlySales} />
        </div>

        <div className="card-saas p-6 shadow-premium">
          <h2 className="font-bold text-brand-900 text-xs uppercase tracking-wider mb-4 font-display flex items-center gap-2">
            <FaTrophy className="text-harvest-500" /> Best Performing Produce
          </h2>
          {analytics.bestSelling && analytics.bestSelling.length > 0 ? (
            <ul className="divide-y divide-surface-100">
              {analytics.bestSelling.map((item, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <span className="font-bold text-xs text-surface-900 font-display">{item._id}</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">
                    {item.totalQty} units
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-surface-400 font-medium">No order history available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
