import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { initiateOrder } from '../services/orderService';
import SmartImage from './SmartImage';
import MandiDealBadge from './MandiDealBadge';
import { FaHeart, FaRegHeart, FaShoppingCart, FaMapMarkerAlt, FaBolt, FaSpinner, FaLeaf, FaSearchPlus, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle, isWishlisted, index = 0 }) => {
  const { addToCart } = useContext(CartContext) || {};
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [buyingNow, setBuyingNow] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'Buyer') {
      toast.error(t('marketplace.loginBuyerToCart', 'Login as Buyer to add to cart'));
      return;
    }
    try {
      if (addToCart) {
        await addToCart(product._id, 1);
        toast.success(t('marketplace.addedToCart', { name: product.name }, `Added 1 unit of ${product.name} to cart! 🛒`));
      }
    } catch (err) {
      toast.error(t('marketplace.failedAddToCart', 'Failed to add to cart'));
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t('marketplace.loginToPurchase', 'Please login to purchase'));
      navigate('/login');
      return;
    }
    if (user.role !== 'Buyer') {
      toast.error(t('marketplace.onlyBuyersPurchase', 'Only Buyers can purchase'));
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
      toast.error(err.response?.data?.message || err.message || t('marketplace.failedInitiateOrder', 'Failed to initiate order'));
      setBuyingNow(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    
    if (onWishlistToggle) {
      onWishlistToggle(product._id);
    }
  };

  const staggerClass = `stagger-${(index % 8) + 1}`;

  return (
    <Link to={`/products/${product._id}`} className={`card-luxe group flex flex-col overflow-hidden h-full min-w-0 w-full animate-slide-up ${staggerClass}`}>
      <div className="relative aspect-[4/3] bg-emerald-50/50 overflow-hidden rounded-t-[1.1rem] sm:rounded-t-[1.4rem]">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Gradient Overlay & Quick View Icon on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 via-surface-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm text-brand-800 p-3 rounded-full transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-lg shadow-black/20">
            <FaSearchPlus className="text-xl" />
          </div>
        </div>
        
        {/* Category & Farm Origin Pills */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col gap-1 max-w-[80%]">
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-brand-900 bg-white/95 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm border border-brand-100 truncate">
            <FaLeaf className="text-brand-600 text-[8px] sm:text-[9px] shrink-0" />
            <span className="truncate">{product.category || 'Farm Produce'}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wider text-white bg-emerald-800/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm">
            🌾 Direct Farm
          </span>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-[3px] flex items-center justify-center z-20">
            <span className="bg-red-500 text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
              {t('marketplace.outOfStock', 'Out of Stock')}
            </span>
          </div>
        )}

        {onWishlistToggle && (
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20 ${isHeartAnimating ? 'animate-bounce' : ''}`}
            aria-label="Toggle Wishlist"
          >
            {isWishlisted ? <FaHeart className="text-red-500 text-[10px] sm:text-xs" /> : <FaRegHeart className="text-surface-400 text-[10px] sm:text-xs hover:text-red-500" />}
          </button>
        )}
      </div>

      <div className="p-2 sm:p-4 flex flex-col flex-1 relative z-20 bg-white min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-surface-900 mb-1 truncate group-hover:text-brand-700 transition-colors font-display">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-surface-500 mb-1 sm:mb-2 min-w-0">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <FaMapMarkerAlt className="text-emerald-600 text-[9px] sm:text-xs shrink-0" />
            <span className="truncate font-medium">{product.location || 'Gujarat Farm'}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-extrabold shrink-0">
            <FaStar className="text-amber-400 text-[7px] sm:text-[9px]" /> 4.9
          </div>
        </div>

        {/* Mandi Savings Deal Badge */}
        <div className="mb-1.5 sm:mb-2 min-w-0">
          <MandiDealBadge productName={product.name} price={product.price} size="sm" />
        </div>

        <div className="mt-auto pt-1.5 sm:pt-3 border-t border-surface-100 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5 sm:mb-3">
            <div className="truncate min-w-0">
              <span className="text-xs sm:text-lg font-black text-surface-900 font-display">₹{product.price}</span>
              <span className="text-[9px] sm:text-xs text-surface-500 font-medium ml-0.5 sm:ml-1">/ {product.unit || 'kg'}</span>
            </div>
            <span className={`text-[8px] sm:text-[11px] font-bold px-1 sm:px-2 py-0.5 rounded-full shrink-0 ${product.quantity > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {product.quantity} left
            </span>
          </div>

          {user?.role === 'Buyer' && !isOutOfStock && (
            <div className="flex gap-1 sm:gap-2 pt-0.5">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-1.5 sm:py-2 px-1 sm:px-2 bg-surface-100 hover:bg-emerald-50 text-surface-800 hover:text-brand-800 rounded-xl border border-surface-200 hover:border-emerald-200 transition-all text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 active:scale-95 group/btn truncate"
                title={t('marketplace.addToCart', 'Add to Cart')}
              >
                <FaShoppingCart className="text-[9px] sm:text-xs group-hover/btn:animate-wiggle shrink-0" /> 
                <span className="truncate">{t('marketplace.addToCart', 'Cart')}</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="flex-1 py-1.5 sm:py-2 px-1 sm:px-2 bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 text-white rounded-xl transition-all text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-sm shadow-brand-900/20 active:scale-95 disabled:opacity-60 hover-glow truncate"
                title={t('marketplace.buyNow', 'Buy Now')}
              >
                {buyingNow ? <FaSpinner className="animate-spin text-[9px] sm:text-xs shrink-0" /> : <FaBolt className="text-[9px] sm:text-xs text-harvest-300 shrink-0" />} 
                <span className="truncate">{t('marketplace.buyNow', 'Buy')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
