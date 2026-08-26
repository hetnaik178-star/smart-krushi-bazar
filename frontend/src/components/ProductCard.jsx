import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { initiateOrder } from '../services/orderService';
import SmartImage from './SmartImage';
import { FaHeart, FaRegHeart, FaShoppingCart, FaMapMarkerAlt, FaBolt, FaSpinner, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle, isWishlisted }) => {
  const { addToCart } = useContext(CartContext) || {};
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [buyingNow, setBuyingNow] = useState(false);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'Buyer') {
      toast.error('Login as Buyer to add to cart');
      return;
    }
    try {
      if (addToCart) {
        await addToCart(product._id, 1);
        toast.success(`Added 1 unit of ${product.name} to cart! 🛒`);
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }
    if (user.role !== 'Buyer') {
      toast.error('Only Buyers can purchase');
      return;
    }
    if (isOutOfStock) return;

    setBuyingNow(true);
    try {
      const result = await initiateOrder(product._id, 1);
      if (result.success && result.data?._id) {
        navigate(`/checkout/order/${result.data._id}`);
      } else {
        throw new Error(result.message || 'Failed to initiate order');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate order');
      setBuyingNow(false);
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="card-saas group flex flex-col overflow-hidden h-full">
      <div className="relative aspect-[4/3] bg-emerald-50/50 overflow-hidden rounded-t-[1.25rem]">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Category Pill Over Image */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-brand-100">
            <FaLeaf className="text-brand-600 text-[9px]" /> {product.category || 'Farm Produce'}
          </span>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-[3px] flex items-center justify-center z-20">
            <span className="bg-red-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(product._id);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
            aria-label="Toggle Wishlist"
          >
            {isWishlisted ? <FaHeart className="text-red-500 text-xs" /> : <FaRegHeart className="text-surface-400 text-xs hover:text-red-500" />}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-surface-900 mb-1 line-clamp-1 group-hover:text-brand-700 transition-colors font-display">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-3">
          <FaMapMarkerAlt className="text-emerald-600 text-xs flex-shrink-0" />
          <span className="line-clamp-1 font-medium">{product.location || 'Gujarat Farm'}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-surface-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-black text-surface-900 font-display">₹{product.price}</span>
              <span className="text-xs text-surface-500 font-medium ml-1">/ {product.unit || 'kg'}</span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${product.quantity > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {product.quantity} left
            </span>
          </div>

          {user?.role === 'Buyer' && !isOutOfStock && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 bg-surface-100 hover:bg-emerald-50 text-surface-800 hover:text-brand-800 rounded-xl border border-surface-200 hover:border-emerald-200 transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                title="Add to Cart"
              >
                <FaShoppingCart className="text-xs" /> Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="flex-1 py-2 bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-brand-900/20 active:scale-95 disabled:opacity-60"
                title="Buy Now"
              >
                {buyingNow ? <FaSpinner className="animate-spin text-xs" /> : <FaBolt className="text-xs text-harvest-300" />} Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
