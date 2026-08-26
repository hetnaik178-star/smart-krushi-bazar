import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../services/wishlistService';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';
import { FaHeart, FaStore, FaLeaf } from 'react-icons/fa';

const WishlistPage = () => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200 mb-2">
            <FaHeart className="text-[9px]" /> Saved Farm Produce
          </span>
          <h1 className="page-heading">
            My Saved Harvest Wishlist
          </h1>
          <p className="text-xs text-surface-500 font-medium mt-1">Quick access to crops and produce you want to purchase later.</p>
        </div>
        <Link to="/products" className="btn-saas-primary text-xs !py-2.5 flex items-center gap-1.5 shadow-sm font-bold">
          <FaStore /> Browse Marketplace
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
          {products.map(p => (
            <ProductCard key={p._id} product={p} isWishlisted={true} onWishlistToggle={() => handleRemove(p._id)} />
          ))}
        </div>
      ) : (
        <div className="card-saas p-12 text-center max-w-lg mx-auto shadow-premium">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            <FaHeart />
          </div>
          <h2 className="text-xl font-bold text-surface-900 font-display mb-2">Your Wishlist is Empty</h2>
          <p className="text-xs text-surface-500 max-w-sm mx-auto mb-6 font-medium">
            Explore fresh crops in the Marketplace and click the heart icon on any product card to save produce here.
          </p>
          <Link to="/products" className="btn-saas-primary text-xs !py-3 !px-6">
            Browse Crops Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
