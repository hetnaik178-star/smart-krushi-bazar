import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import VoiceSearchButton from '../components/VoiceSearchButton';
import MiddlemanProfitCalculator from '../components/MiddlemanProfitCalculator';
import { useLanguage } from '../context/LanguageContext';
import { FaSearch, FaFilter, FaLeaf, FaSort, FaTimes, FaLayerGroup, FaSeedling, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';

const Products = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: '', label: t('marketplace.allCrops', 'All Crops'), icon: '🌾' },
    { id: 'Vegetables', label: t('marketplace.vegetables', 'Vegetables'), icon: '🥦' },
    { id: 'Fruits', label: t('marketplace.fruits', 'Fruits'), icon: '🍎' },
    { id: 'Grains', label: t('marketplace.grains', 'Grains'), icon: '🌾' },
    { id: 'Pulses', label: t('marketplace.pulses', 'Pulses'), icon: '🫘' },
    { id: 'Other', label: t('marketplace.other', 'Other Crops'), icon: '📦' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ search, category, location, minPrice, maxPrice, sort, page, limit: 12 });
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.totalProducts || data.products.length);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setPage(1);
          setTotalPages(1);
          setTotalProducts(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, location, minPrice, maxPrice, sort, page]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSort('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 page-fade-in w-full overflow-x-hidden">
      {/* Visual Agro Hero Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-5 sm:mb-8 p-4 sm:p-10 bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-900 shadow-premium border border-emerald-800/40 text-white animate-scale-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Floating Decorative Elements */}
        <FaLeaf className="absolute top-8 right-16 text-emerald-400/40 text-4xl animate-float-slow" />
        <FaLeaf className="absolute bottom-10 right-48 text-emerald-300/30 text-2xl animate-float-delayed" />
        <FaSeedling className="absolute top-1/2 right-1/3 text-emerald-500/20 text-5xl animate-float" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full mb-2 sm:mb-3 border border-emerald-400/30 backdrop-blur-md animate-fade-in">
              <FaSeedling className="text-emerald-400 text-xs" /> {t('marketplace.directMandiTrade', 'Direct Kisan Mandi & Produce Trade')}
            </div>
            <h1 className="text-xl sm:text-4xl font-black font-display tracking-tight text-white mb-1.5 sm:mb-2">
              {t('marketplace.title', 'Fresh Harvest Marketplace')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed stagger-1">
              {t('marketplace.subtitle', 'Procure farm-fresh vegetables, organic fruits, golden grains, and pulses directly from verified Indian farmers with 0% middleman cut.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-row sm:gap-3 animate-slide-left shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl font-black text-harvest-300 font-display animate-count">{totalProducts || 10}+</p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-200 truncate">{t('marketplace.activeListings', 'Active Listings')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl font-black text-white font-display">0%</p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-200 truncate">{t('marketplace.brokerMarkup', 'Broker Markup')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 sm:pb-3 mb-4 sm:mb-6 scrollbar-none no-scrollbar">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setPage(1); }}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 animate-slide-up stagger-${(idx % 8) + 1} ${
              category === cat.id
                ? 'bg-gradient-to-r from-brand-700 to-emerald-600 text-white shadow-md shadow-brand-900/20 scale-105 ring-2 ring-emerald-300 animate-glow'
                : 'bg-white text-surface-700 hover:bg-emerald-50 hover:text-brand-800 border border-surface-200 hover:border-emerald-200 shadow-sm'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar with Voice Search */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl shadow-premium border border-surface-200 mb-8 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative flex items-center">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder', 'Search crop title (e.g. Kesar Mango, Wheat, Onion)...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-saas !pl-9 !pr-10 text-xs focus:ring-brand-500 focus:border-brand-500 transition-all w-full"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearchButton 
                onSpeechResult={(spokenText) => {
                  setSearch(spokenText);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-saas text-xs font-semibold cursor-pointer"
            >
              <option value="">{t('marketplace.sortFeatured', 'Sort: Featured Produce')}</option>
              <option value="price_asc">{t('marketplace.sortLowToHigh', 'Price: Low to High')}</option>
              <option value="price_desc">{t('marketplace.sortHighToLow', 'Price: High to Low')}</option>
              <option value="newest">{t('marketplace.sortNewest', 'Recently Harvested')}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('marketplace.filterDistrict', 'Filter District...')}
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="input-saas text-xs flex-1"
            />
            {(search || category || location || sort) && (
              <button
                onClick={handleClearFilters}
                className="btn-saas-secondary text-xs !px-3 shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                title={t('marketplace.clearFilters', 'Clear Filters')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="card-saas h-72 sm:h-80 rounded-2xl p-3 sm:p-4 skeleton-shimmer"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-saas p-8 sm:p-16 text-center shadow-premium animate-scale-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-2xl sm:text-3xl text-emerald-600 border border-emerald-200">
            🌾
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 font-display mb-1">{t('marketplace.noProduceFound', 'No Farm Produce Found')}</h2>
          <p className="text-xs text-surface-500 max-w-md mx-auto mb-6 font-medium">
            {t('marketplace.noProduceDesc', 'No crops matched your current filter criteria. Try clearing filters or searching for other commodities.')}
          </p>
          <button onClick={handleClearFilters} className="btn-saas-primary text-xs !py-2.5 !px-6 shadow-sm font-bold hover-glow">
            {t('marketplace.viewAllCrops', 'View All Crops')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 w-full">
          {products.map((product, idx) => (
            <ProductCard key={product._id} product={product} index={idx} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 animate-fade-in">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-saas-secondary text-xs !py-2 !px-4 disabled:opacity-40 transition-transform active:scale-95"
          >
            {t('common.previous', '← Previous')}
          </button>
          <span className="text-xs font-bold text-surface-600 px-3">
            {t('common.pageInfo', { page, totalPages }, `Page ${page} of ${totalPages}`)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-saas-secondary text-xs !py-2 !px-4 disabled:opacity-40 transition-transform active:scale-95"
          >
            {t('common.next', 'Next →')}
          </button>
        </div>
      )}

      {/* Direct Trade Profit Comparison Calculator */}
      <div className="mt-16 pt-8 border-t border-emerald-500/20">
        <MiddlemanProfitCalculator />
      </div>
    </div>
  );
};

export default Products;
