import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../services/wishlistService';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';
import { FaHeart, FaStore, FaLeaf } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const WishlistPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await getWishlist();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-slide-up">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-red-700 uppercase tracking-widest bg-gradient-to-r from-red-100 to-pink-50 px-3 py-1 rounded-full border border-red-200 mb-2 shadow-sm">
            <FaHeart className="text-[10px] text-red-500 animate-pulse" /> {t('buyer.savedProduce', 'Saved Farm Produce')}
          </span>
          <h1 className="page-heading">
            {t('buyer.wishlistTitle', 'My Saved Harvest Wishlist')}
          </h1>
          <p className="text-xs text-surface-500 font-medium mt-1">{t('buyer.wishlistSubtitle', 'Quick access to crops and produce you want to purchase later.')}</p>
        </div>
        <Link to="/products" className="btn-saas-primary text-xs !py-2.5 flex items-center gap-1.5 shadow-sm font-bold hover-glow">
          <FaStore /> {t('buyer.browseMarket', 'Browse Marketplace')}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="card-saas h-80 p-4 skeleton-shimmer"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p, idx) => (
            <div key={p._id} className={`animate-slide-up stagger-${(idx % 8) + 1}`}>
              <ProductCard product={p} isWishlisted={true} onWishlistToggle={() => handleRemove(p._id)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card-saas p-12 text-center max-w-lg mx-auto shadow-premium animate-slide-up stagger-1">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm animate-bounce-gentle border border-red-100">
            <FaHeart />
          </div>
          <h2 className="text-xl font-bold text-surface-900 font-display mb-2">{t('buyer.wishlistEmpty', 'Your Wishlist is Empty')}</h2>
          <p className="text-xs text-surface-500 max-w-sm mx-auto mb-6 font-medium">
            {t('buyer.wishlistEmptyDesc', 'Explore fresh crops in the Marketplace and click the heart icon on any product card to save produce here.')}
          </p>
          <Link to="/products" className="btn-saas-primary text-xs !py-3 !px-6 hover-glow">
            {t('buyer.browseCropsNow', 'Browse Crops Now')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
