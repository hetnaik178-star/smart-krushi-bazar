import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import SmartImage from '../../components/SmartImage';
import { FaBox, FaPlus, FaEdit, FaTrashAlt, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getMyProducts();
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load crop listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Crop removed from marketplace');
      } catch (err) {
        toast.error('Failed to delete crop');
      }
    }
  };

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label={t('nav.dashboard', 'Back to Dashboard')} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-gradient-to-r from-brand-900 to-brand-700 p-8 rounded-2xl shadow-premium animate-slide-up relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold mb-3 backdrop-blur-sm shadow-sm">
            <FaLeaf className="text-emerald-300" /> {t('farmer.manageListings', 'Farm Inventory')}
          </div>
          <h1 className="text-3xl font-black font-display flex items-center gap-3">
            {t('farmer.manageListings', 'Active Farm Crop Listings')}
          </h1>
          <p className="text-emerald-100 font-medium mt-2 max-w-xl">
            {t('farmer.dashboardSubtitle', 'Manage your active harvest inventory, price updates, and monitor available stock units in real-time.')}
          </p>
        </div>
        <Link to="/farmer/add-product" className="btn-saas-secondary bg-white text-brand-800 border-white hover:bg-emerald-50 text-xs flex items-center gap-2 shadow-sm font-bold relative z-10 hover-glow">
          <FaPlus /> {t('farmer.addNewHarvest', 'List New Crop')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-20 skeleton-shimmer"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-saas p-8 animate-scale-in">
          <EmptyState
            icon={FaBox}
            title={t('farmer.noListingsYet', 'No Crops Listed Yet')}
            description={t('farmer.noListingsDesc', "You haven't listed any farm produce for sale yet. Add your first harvest to connect directly with verified buyers.")}
            actionText={t('farmer.addNewHarvest', 'List Your First Crop')}
            actionLink="/farmer/add-product"
          />
        </div>
      ) : (
        <div className="card-saas overflow-hidden shadow-premium animate-slide-up stagger-1">
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('common.image', 'Image')}</th>
                  <th className="px-6 py-4">{t('farmer.cropTitle', 'Crop Name')}</th>
                  <th className="px-6 py-4">{t('farmer.categoryLabel', 'Category')}</th>
                  <th className="px-6 py-4">{t('common.price', 'Price / Unit')}</th>
                  <th className="px-6 py-4">{t('farmer.quantityLabel', 'Available Stock')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {products.map((p, idx) => (
                  <tr key={p._id} className={`hover:bg-emerald-50/30 transition-colors animate-fade-in-left stagger-${(idx % 8) + 1}`}>
                    <td className="px-6 py-4">
                      <div className="rounded-xl overflow-hidden shadow-sm inline-block border border-surface-200 bg-surface-50">
                        <SmartImage
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-900 font-display text-sm">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-100 text-surface-700 border border-surface-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-800 text-sm font-display">₹{p.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-bold text-surface-800">{p.quantity} units</span>
                        {p.quantity === 0 && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded border border-red-200 uppercase tracking-wider">
                            {t('marketplace.outOfStock', 'Out of Stock')}
                          </span>
                        )}
                        {p.quantity > 0 && p.quantity < 10 && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded border border-amber-200 uppercase tracking-wider">
                            {t('farmer.lowStock', 'Low Stock')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/farmer/edit-product/${p._id}`}
                        className="btn-saas-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200"
                      >
                        <FaEdit /> {t('common.edit', 'Edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="btn-saas-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <FaTrashAlt /> {t('common.delete', 'Delete')}
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
  );
};

export default MyProducts;
