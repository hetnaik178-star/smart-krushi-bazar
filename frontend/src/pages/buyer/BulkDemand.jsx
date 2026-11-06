import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { 
  FaBoxes, FaPlus, FaCheckCircle, FaClock, FaMapMarkerAlt, 
  FaCalendarAlt, FaRupeeSign, FaTrash, FaShieldAlt, FaChartLine,
  FaTags, FaBuilding, FaHandshake, FaTimes
} from 'react-icons/fa';

export default function BulkDemand() {
  const { user } = useContext(AuthContext);
  const { t, language } = useLanguage();

  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    cropName: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'Quintal',
    targetPrice: '',
    deliveryLocation: user?.location || 'Gujarat, India',
    requiredByDate: '',
    qualityNotes: ''
  });

  const popularCrops = [
    'Fresh Tomatoes', 'Valsadi Alphonso Mangoes', 'Sharbati Wheat', 
    'Desi Chana', 'Nashik Red Onions', 'Farm Fresh Potatoes', 
    'Organic Basmati Paddy', 'Gujarat Tur Dal'
  ];

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await API.get('/demands/my');
      if (res.data?.success) {
        setDemands(res.data.demands);
      }
    } catch (err) {
      console.warn('Could not fetch demands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cropName || !form.quantity || !form.targetPrice || !form.requiredByDate) {
      toast.error(t('buyer.fillAllFields', 'Please fill all required procurement details'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/demands', form);
      if (res.data?.success) {
        toast.success(t('buyer.demandPostedSuccess', 'Bulk procurement demand posted successfully!'));
        setDemands([res.data.demand, ...demands]);
        setShowModal(false);
        setForm({
          cropName: '',
          category: 'Vegetables',
          quantity: '',
          unit: 'Quintal',
          targetPrice: '',
          deliveryLocation: user?.location || 'Gujarat, India',
          requiredByDate: '',
          qualityNotes: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post demand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Fulfilled' : 'Active';
    try {
      const res = await API.patch(`/demands/${id}/status`, { status: nextStatus });
      if (res.data?.success) {
        setDemands(demands.map(d => d._id === id ? { ...d, status: nextStatus } : d));
        toast.success(t('buyer.statusUpdated', `Demand marked as ${nextStatus}`));
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to remove this demand requirement?'))) return;
    try {
      await API.delete(`/demands/${id}`);
      setDemands(demands.filter(d => d._id !== id));
      toast.success(t('buyer.demandDeleted', 'Procurement requirement removed'));
    } catch (err) {
      toast.error('Failed to remove demand');
    }
  };

  // Metrics
  const activeCount = demands.filter(d => d.status === 'Active' || d.status === 'In Negotiation').length;
  const totalVolumeKg = demands.reduce((acc, d) => {
    const qty = Number(d.quantity) || 0;
    if (d.unit === 'Quintal') return acc + (qty * 100);
    if (d.unit === 'Tonne') return acc + (qty * 1000);
    if (d.unit === 'Crates') return acc + (qty * 20);
    return acc + qty;
  }, 0);
  // Estimated middleman commission saved (approx 12% vs Mandi middlemen)
  const estimatedSavings = Math.round(demands.reduce((acc, d) => acc + (d.targetPrice * d.quantity * 0.12), 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton fallback="/buyer/dashboard" label={t('nav.dashboard', 'Back to Dashboard')} />
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-brand-800 p-6 sm:p-8 text-white shadow-premium mb-8 animate-slide-up">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold mb-3 backdrop-blur-sm">
              <FaBoxes className="text-amber-400" />
              <span>{t('buyer.b2bPortalBadge', 'B2B Wholesale & Commercial Procurement')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mb-2">
              {t('buyer.bulkDemandTitle', 'Wholesale Crop Demand & Procurement')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              {t('buyer.bulkDemandSubtitle', 'Broadcast your bulk purchasing requirements directly to registered farmers. Lock in farm-gate pricing with 0% intermediary markup.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="btn-luxe-primary !bg-white !text-brand-900 hover:!bg-emerald-50 shadow-xl text-xs font-extrabold flex items-center gap-2 py-3 px-5 rounded-2xl w-full sm:w-auto justify-center cursor-pointer transition-transform hover:scale-105"
            >
              <FaPlus className="text-emerald-700" />
              <span>{t('buyer.postNewDemand', 'Post Buy Requirement')}</span>
            </button>
            <Link
              to="/mandi"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FaChartLine className="text-amber-400" />
              <span>{t('nav.mandiPrices', 'Check Mandi Benchmarks')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="card-luxe p-5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center text-lg mb-3 shadow-md">
            <FaBoxes />
          </div>
          <p className="text-2xl font-black text-surface-900 font-display">{activeCount}</p>
          <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{t('buyer.activeDemands', 'Active Procurement Inquiries')}</p>
        </div>

        <div className="card-luxe p-5 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center text-lg mb-3 shadow-md">
            <FaTags />
          </div>
          <p className="text-2xl font-black text-surface-900 font-display">{(totalVolumeKg / 100).toFixed(0)} <span className="text-sm font-bold text-surface-500">Qtl</span></p>
          <p className="text-xs text-surface-500 font-bold uppercase tracking-wider mt-1">{t('buyer.totalVolumeSourced', 'Total Volume Requisitioned')}</p>
        </div>

        <div className="card-luxe p-5 relative overflow-hidden group bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/20 border-emerald-200">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg mb-3 shadow-md">
            <FaRupeeSign />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-emerald-800 font-display">₹{estimatedSavings.toLocaleString()}</p>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              0% Middleman
            </span>
          </div>
          <p className="text-xs text-surface-600 font-bold uppercase tracking-wider mt-1">{t('buyer.middlemanSavings', 'Estimated Intermediary Savings')}</p>
        </div>
      </div>

      {/* Main Content Area: Demands Table */}
      <div className="card-luxe overflow-hidden shadow-xl border border-surface-200/80 mb-8">
        <div className="p-5 border-b border-surface-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-50/70">
          <div>
            <h2 className="font-bold text-surface-900 font-display text-sm flex items-center gap-2">
              <FaHandshake className="text-emerald-600" />
              <span>{t('buyer.myDemandsList', 'Your Active Wholesale Procurement Postings')}</span>
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">{t('buyer.demandsListSubtitle', 'Registered farmers in your area can view these requests and reach out with direct supply quotes.')}</p>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl">
            {demands.length} {t('buyer.requirementsPosted', 'Requisitions')}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-surface-500">{t('common.loading', 'Loading requirements...')}</p>
          </div>
        ) : demands.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FaBoxes}
              title={t('buyer.noDemandsTitle', 'No Wholesale Demands Posted Yet')}
              description={t('buyer.noDemandsDesc', 'Need 100kg of tomatoes or 50 quintals of wheat? Post your requirement to receive direct farm-gate supply quotes.')}
              actionText={t('buyer.postFirstDemand', 'Create First Buy Requirement')}
              onAction={() => setShowModal(true)}
            />
          </div>
        ) : (
          <div>
            {/* Mobile Cards List (Phones < 640px) */}
            <div className="block sm:hidden divide-y divide-surface-100 p-3 space-y-3">
              {demands.map(d => (
                <div key={d._id} className="p-3.5 bg-white rounded-2xl border border-surface-200/80 shadow-sm space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-surface-900">{d.cropName}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {d.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title={t('common.delete', 'Remove')}
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-50/70 p-2.5 rounded-xl border border-surface-100">
                    <div>
                      <span className="text-[10px] text-surface-400 font-bold uppercase block">{t('common.quantity', 'Required Qty')}</span>
                      <span className="font-extrabold text-surface-900">{d.quantity} {d.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-400 font-bold uppercase block">{t('buyer.targetOffer', 'Target Offer')}</span>
                      <span className="font-black text-brand-800 font-display">₹{d.targetPrice} / {d.unit}</span>
                    </div>
                  </div>

                  <div className="text-xs text-surface-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-surface-800">
                      <FaMapMarkerAlt className="text-emerald-600 text-[11px] shrink-0" />
                      <span className="truncate">{d.deliveryLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-surface-500 text-[11px]">
                      <FaCalendarAlt className="text-surface-400 text-[10px] shrink-0" />
                      <span>{d.requiredByDate ? new Date(d.requiredByDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ASAP'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-100 flex items-center justify-between">
                    <span className="text-[10px] text-surface-400 font-bold uppercase">{t('common.status', 'Status')}</span>
                    <button
                      onClick={() => handleStatusToggle(d._id, d.status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                        d.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : d.status === 'In Negotiation'
                          ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                          : 'bg-surface-100 text-surface-600 border-surface-300'
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500 animate-ping' : d.status === 'In Negotiation' ? 'bg-blue-500' : 'bg-surface-400'}`}></span>
                      <span>{d.status}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto scrollbar-saas">
              <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 font-bold uppercase text-[11px] tracking-wider border-b border-surface-200">
                <tr>
                  <th className="p-4">{t('farmer.cropTitle', 'Crop & Category')}</th>
                  <th className="p-4">{t('common.quantity', 'Required Qty')}</th>
                  <th className="p-4">{t('buyer.targetOffer', 'Target Offer Rate')}</th>
                  <th className="p-4">{t('buyer.deliveryTarget', 'Delivery & Date')}</th>
                  <th className="p-4">{t('common.status', 'Procurement Status')}</th>
                  <th className="p-4 text-right">{t('common.actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {demands.map(d => (
                  <tr key={d._id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="p-4 font-bold text-surface-900 font-display">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-surface-900">{d.cropName}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-max mt-1">
                          {d.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-surface-800">
                      <span className="font-extrabold text-sm">{d.quantity}</span>{' '}
                      <span className="text-surface-500 font-bold">{d.unit}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-brand-800 font-display text-sm">₹{d.targetPrice}</span>
                      <span className="text-[10px] text-surface-500 font-semibold block">per {d.unit}</span>
                    </td>
                    <td className="p-4 text-surface-600">
                      <div className="flex items-center gap-1.5 text-surface-800 font-semibold">
                        <FaMapMarkerAlt className="text-emerald-600 text-[10px]" />
                        <span>{d.deliveryLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-surface-500 text-[10px] mt-1 font-medium">
                        <FaCalendarAlt className="text-surface-400 text-[9px]" />
                        <span>{d.requiredByDate ? new Date(d.requiredByDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ASAP'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(d._id, d.status)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                          d.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : d.status === 'In Negotiation'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                            : 'bg-surface-100 text-surface-600 border-surface-300'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500 animate-ping' : d.status === 'In Negotiation' ? 'bg-blue-500' : 'bg-surface-400'}`}></span>
                        <span>{d.status}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title={t('common.delete', 'Remove')}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* Post Requirement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-500/20 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
                  <FaBoxes />
                </div>
                <div>
                  <h3 className="font-black text-surface-900 font-display text-lg">
                    {t('buyer.postRequirementTitle', 'Post Wholesale Crop Requirement')}
                  </h3>
                  <p className="text-xs text-surface-500 font-medium">
                    {t('buyer.postRequirementSubtitle', 'Broadcast your demand to certified farmers with 0% middleman fees.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500 block mb-1.5">
                {t('buyer.quickFillCrop', 'Quick Pick Popular Crops')}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularCrops.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, cropName: c })}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      form.cropName === c
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-emerald-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Crop Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('farmer.cropTitle', 'Crop Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Tomatoes"
                    value={form.cropName}
                    onChange={e => setForm({ ...form, cropName: e.target.value })}
                    className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('common.category', 'Category')} *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200 bg-white"
                  >
                    <option value="Vegetables">{t('category.vegetables', 'Vegetables')}</option>
                    <option value="Fruits">{t('category.fruits', 'Fruits')}</option>
                    <option value="Grains">{t('category.grains', 'Grains')}</option>
                    <option value="Pulses">{t('category.pulses', 'Pulses')}</option>
                    <option value="Spices">{t('category.spices', 'Spices')}</option>
                    <option value="Other">{t('category.other', 'Other')}</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('common.quantity', 'Required Quantity')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('buyer.unitLabel', 'Quantity Unit')} *
                  </label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200 bg-white"
                  >
                    <option value="Quintal">Quintal (100 kg)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="Tonne">Metric Tonne (1,000 kg)</option>
                    <option value="Crates">Crates (20-25 kg)</option>
                    <option value="Bags">Gunny Bags (50 kg)</option>
                  </select>
                </div>
              </div>

              {/* Target Price & Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('buyer.targetOffer', 'Target Offer Rate (₹ per unit)')} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 28"
                      value={form.targetPrice}
                      onChange={e => setForm({ ...form, targetPrice: e.target.value })}
                      className="input-saas text-xs w-full py-2 pl-7 pr-3 rounded-xl border border-surface-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    {t('buyer.requiredByDate', 'Needed By Date')} *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.requiredByDate}
                    onChange={e => setForm({ ...form, requiredByDate: e.target.value })}
                    className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200 bg-white"
                  />
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">
                  {t('buyer.deliveryDestination', 'Delivery Destination (City / Mandi / Warehouse)')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APMC Market Yard, Bardoli, Gujarat"
                  value={form.deliveryLocation}
                  onChange={e => setForm({ ...form, deliveryLocation: e.target.value })}
                  className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200"
                />
              </div>

              {/* Quality Specifications */}
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">
                  {t('buyer.qualitySpecs', 'Quality Requirements & Packaging Notes')}
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Grade A ripe produce, minimum transit damage, clean gunny bags."
                  value={form.qualityNotes}
                  onChange={e => setForm({ ...form, qualityNotes: e.target.value })}
                  className="input-saas text-xs w-full py-2 px-3 rounded-xl border border-surface-200"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-surface-600 hover:bg-surface-100 transition-all"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-luxe-primary text-xs !py-2 !px-5 shadow-lg flex items-center gap-2"
                >
                  <FaCheckCircle />
                  <span>{submitting ? t('common.saving', 'Posting...') : t('buyer.publishDemand', 'Publish Requisition')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
