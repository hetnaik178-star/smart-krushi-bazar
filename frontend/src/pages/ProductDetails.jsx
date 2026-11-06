import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { initiateOrder } from '../services/orderService';
import { addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import WhatsAppShareButton from '../components/WhatsAppShareButton';
import MandiDealBadge from '../components/MandiDealBadge';
import MandiSavingsCalculator from '../components/MandiSavingsCalculator';
import ReviewsSection from '../components/ReviewsSection';
import { FaMapMarkerAlt, FaUserCheck, FaHeart, FaRegHeart, FaShieldAlt, FaTruck, FaShoppingCart, FaBolt, FaLeaf, FaComments, FaCalculator } from 'react-icons/fa';
import { resolveProduceImage, resolveFarmPhoto } from '../utils/produceTraceability';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState('produce');

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(p => {
        setProduct(p);
        setLoading(false);
      })
      .catch(() => {
        setError('Product not found');
        setLoading(false);
      });
  }, [id]);

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return navigate('/login');
    }
    if (user.role !== 'Buyer') {
      toast.error('Only Buyers can place orders');
      return;
    }
    if (quantity > product.quantity) {
      const msg = 'Insufficient quantity available';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (quantity <= 0) {
      const msg = 'Quantity must be greater than zero';
      setError(msg);
      toast.error(msg);
      return;
    }

    setBuying(true);
    setError('');

    try {
      const result = await initiateOrder(product._id, Number(quantity));
      if (result.success && result.data?._id) {
        navigate(`/checkout/order/${result.data._id}`);
      } else {
        throw new Error(result.message || 'Failed to initiate order');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to initiate order';
      setError(msg);
      toast.error(msg);
    } finally {
      setBuying(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login as Buyer');
      return navigate('/login');
    }
    if (user.role !== 'Buyer') {
      toast.error('Only Buyers can add items to cart');
      return;
    }
    try {
      if (addToCart) {
        await addToCart(product._id, Number(quantity));
        toast.success(`Added ${quantity} unit(s) to cart! 🛒`);
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'Buyer') return toast.error('Only Buyers can save items');

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
        toast.success('Removed from Wishlist');
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
        toast.success('Added to Wishlist ❤️');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="card-saas p-8 skeleton-shimmer h-96"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center card-saas">
        <h2 className="text-xl font-bold text-surface-900 mb-2 font-display">{t('productDetails.produceUnavailable', 'Produce Listing Unavailable')}</h2>
        <p className="text-xs text-surface-500 mb-6">{error || t('productDetails.produceUnavailableDesc', 'The produce listing you are looking for has been sold out or removed.')}</p>
        <Link to="/products" className="btn-saas-primary text-xs">{t('productDetails.browseHarvest', 'Browse Fresh Harvest')}</Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <BackButton fallback="/products" label={t('productDetails.backToMarket', 'Back to Marketplace')} />
        {user?.role === 'Buyer' && (
          <button
            onClick={handleWishlistToggle}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm hover:bg-surface-50 transition-all active:scale-95"
          >
            {isWishlisted ? (
              <>
                <FaHeart className="text-red-500" /> <span className="text-red-600">{t('productDetails.savedInWishlist', 'Saved in Wishlist')}</span>
              </>
            ) : (
              <>
                <FaRegHeart className="text-surface-400" /> <span className="text-surface-600">{t('productDetails.addToWishlist', 'Add to Wishlist')}</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 card-luxe p-6 sm:p-8">
        {/* Product Image & Farm Photo Showcase */}
        <div className="flex flex-col gap-3">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-surface-100/80 rounded-xl border border-surface-200 w-fit">
            <button
              type="button"
              onClick={() => setActiveImageTab('produce')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeImageTab === 'produce'
                  ? 'bg-white text-brand-900 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <FaLeaf className="text-emerald-600 text-[10px]" />
              <span>ताज़ा फसल (Produce)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveImageTab('farm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeImageTab === 'farm'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <FaShieldAlt className="text-[10px]" />
              <span>🌾 खेत की असली तस्वीर (Khet Photo)</span>
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative rounded-2xl overflow-hidden bg-emerald-50 aspect-square shadow-sm border border-surface-200">
            <img
              src={activeImageTab === 'farm' ? resolveFarmPhoto(product).photo : resolveProduceImage(product)}
              alt={activeImageTab === 'farm' ? `${product.name} Farm Field` : product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-brand-900 shadow-md border border-brand-100 uppercase tracking-wider">
                <FaLeaf className="text-emerald-600 text-[10px]" /> {product.category || 'Produce'}
              </span>
              {activeImageTab === 'farm' && (
                <span className="inline-flex items-center gap-1 bg-emerald-800/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold shadow-md">
                  🌾 Verified Field View • {product.location || 'Gujarat'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Information */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 font-display mb-2">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mb-3 font-medium">
              <span className="flex items-center gap-1 text-surface-700">
                <FaMapMarkerAlt className="text-emerald-600" /> {product.location || 'Gujarat'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-brand-800">
                <FaUserCheck className="text-emerald-600" /> {product.farmerId?.name || t('marketplace.verifiedFarmer', 'Verified Farmer')}
              </span>
            </div>

            {/* Live APMC Mandi Deal Badge */}
            <div className="mb-4">
              <MandiDealBadge productName={product.name} price={product.price} size="md" />
            </div>

            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed mb-6">
              {product.description || t('productDetails.defaultDesc', 'Farm-fresh organic produce grown with sustainable agricultural practices and harvested directly for this order.')}
            </p>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="text-3xl font-black text-brand-900 font-display">₹{product.price}</span>
                  <span className="text-xs text-surface-500 font-bold ml-1">/ {product.unit || 'kg'}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {isOutOfStock ? t('marketplace.outOfStock', 'Out of Stock') : `${product.quantity} ${t('common.inStock', 'units in stock')}`}
                </span>
              </div>
            </div>

            {/* Direct Trade Guarantee Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl text-surface-700 font-bold border border-surface-200">
                <FaShieldAlt className="text-emerald-600 text-base shrink-0" /> {t('productDetails.zeroMiddleman', '0% Middleman Loss')}
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl text-surface-700 font-bold border border-surface-200">
                <FaTruck className="text-harvest-600 text-base shrink-0" /> {t('productDetails.deliveryInfo', 'Direct Dispatch from Farm Gate')}
              </div>
            </div>

            {/* Live APMC Price Transparency & Savings Calculator */}
            <div className="mb-6">
              <MandiSavingsCalculator
                productName={product.name}
                price={product.price}
                unit={product.unit || 'kg'}
                quantity={quantity}
              />
            </div>
          </div>

          {/* Action Section for Buyers */}
          {user?.role === 'Buyer' && !isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-surface-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">{t('productDetails.purchaseQuantity', 'Purchase Quantity:')}</label>
                <div className="flex items-center border border-surface-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                    className="px-3.5 py-2 text-brand-900 font-black hover:bg-surface-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-16 text-center bg-transparent text-xs font-black focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(product.quantity, Number(q) + 1))}
                    className="px-3.5 py-2 text-brand-900 font-black hover:bg-surface-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-saas-secondary !py-3.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FaShoppingCart className="text-xs text-surface-600" /> {t('marketplace.addToCart', 'Add to Cart')}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaBolt className="text-xs text-harvest-300" /> {buying ? t('orders.initiatingOrder', 'Initiating…') : `${t('marketplace.buyNow', 'Buy Now')} • ₹${product.price * (Number(quantity) || 1)}`}
                </button>
              </div>
            </div>
          )}

          {!user && !isOutOfStock && (
            <div className="pt-4 border-t border-surface-100">
              <Link to="/login" className="block w-full text-center btn-saas-primary text-xs !py-3.5">
                {t('productDetails.loginToPurchase', 'Login as Buyer to Purchase')}
              </Link>
            </div>
          )}

          {/* 1-Click WhatsApp Kisan Share */}
          <div className="pt-4 border-t border-surface-100">
            <WhatsAppShareButton
              title={`Direct Farm Harvest: ${product.name} (₹${product.price}/${product.unit || 'kg'})`}
              text={`Fresh agricultural produce directly from farmer ${product.farmerId?.name || ''} in ${product.location}. Available quantity: ${product.quantity} units. View crop details on Smart Krushi Bazar:`}
              className="w-full !py-2.5 !text-xs shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Farm Field & Harvest Authenticity Card */}
      <div className="mt-8 card-luxe p-6 sm:p-8 border border-emerald-400/30 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 shadow-xl rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-surface-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs mb-2">
              <FaShieldAlt className="text-emerald-700" />
              <span>100% Verified Farm Gate Origin (खेत से सीधा)</span>
            </div>
            <h3 className="text-xl font-extrabold text-surface-900 font-display">
              खेत और फसल कटाई का लाइव प्रमाण (Farm & Harvest Authenticity)
            </h3>
            <p className="text-xs text-surface-600 mt-1">
              Smart Krushi Bazar guarantees full transparency from the farmer's soil to your doorstep.
            </p>
          </div>
          <Link
            to={`/passport/${product._id}`}
            className="btn-luxe-primary text-xs !py-2.5 !px-5 flex items-center gap-2 shadow-md shrink-0"
          >
            <FaShieldAlt />
            <span>Digital Farm Passport देखें ➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
          {/* Farm Photo Hero */}
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] border-2 border-emerald-500 shadow-md group bg-emerald-950">
            <img
              src={resolveFarmPhoto(product).photo}
              alt={`${product.name} Farm Field`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-950/90 to-transparent p-3 text-white text-xs">
              <span className="font-bold flex items-center gap-1">
                🌾 {resolveFarmPhoto(product).label || `${product.farmerId?.name || 'Kisan'}'s Live Field Photograph`}
              </span>
              <span className="text-[10px] text-emerald-200 block">
                GPS Geotagged & Farm Gate Audited • {product.location || 'Gujarat'}
              </span>
            </div>
          </div>

          {/* Key Field & Harvest Attributes */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-sm">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">किसान (Farmer)</span>
              <span className="text-xs font-bold text-surface-900 flex items-center gap-1 mt-1">
                <FaUserCheck className="text-emerald-600" />
                {product.farmerId?.name || 'Verified Kisan Partner'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">100% Direct Payout (No Intermediary)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-sm">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">कटाई की तारीख (Harvest Freshness)</span>
              <span className="text-xs font-bold text-surface-900 flex items-center gap-1 mt-1">
                📅 ताज़ा कटाई (Harvested 2 days ago)
              </span>
              <span className="text-[10px] text-surface-500 block mt-0.5">Directly picked for this order batch</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-sm">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">खेती की विधि (Cultivation)</span>
              <span className="text-xs font-bold text-surface-900 block mt-1">
                🌱 Organic Soil • Solar Drip Irrigated
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">0% Harmful Chemical Residues</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-sm">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">रसीद व क्यूआर कोड (Invoice & QR)</span>
              <span className="text-xs font-bold text-surface-900 flex items-center gap-1 mt-1">
                📄 Official Tax Invoice with Farm Photo
              </span>
              <span className="text-[10px] text-surface-500 block mt-0.5">Mobile-scannable QR code included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Profile Card Section */}
      {product.farmerId && (
        <div className="mt-8 card-saas p-6 sm:p-7 shadow-premium">
          <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4 font-display">{t('productDetails.sellerDetails', 'Farmer & Producer Profile')}</h3>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar src={product.farmerId.profileImage} name={product.farmerId.name} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-base font-bold text-surface-900 font-display">{product.farmerId.name}</h4>
                <RoleBadge role="Farmer" size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-surface-500 font-semibold">
                <FaMapMarkerAlt className="text-emerald-600" />
                <span>{product.farmerId.location || product.location}</span>
              </div>
              {product.farmerId.bio && (
                <p className="mt-2 text-xs text-surface-600 bg-surface-50 p-3.5 rounded-xl border border-surface-200 leading-relaxed font-medium">
                  {product.farmerId.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                <Link 
                  to={`/farmers/${product.farmerId._id || product.farmerId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                >
                  {t('productDetails.viewAllByFarmer', 'View All Crops by this Farmer →')}
                </Link>
                {user && user.role === 'Buyer' && (
                  <Link
                    to={`/chat?receiverId=${product.farmerId._id || product.farmerId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-700 hover:text-brand-800"
                  >
                    <FaComments className="text-brand-600" /> {t('productDetails.contactFarmer', 'Chat with Farmer')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farm-to-Door Freight & Delivery Logistics Widget */}
      <div className="mt-8 card-luxe p-6 sm:p-7 bg-gradient-to-r from-emerald-950 via-brand-900 to-teal-950 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-emerald-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-harvest-300 shrink-0 border border-white/15">
            <FaTruck />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-harvest-300 mb-1">
              Farm-to-Door Delivery Logistics
            </div>
            <h4 className="text-base font-bold font-display text-white">
              Need Transport from {product.location || 'Farm Gate'} to Your City?
            </h4>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Calculate road distance, recommend commercial vehicles (Auto, Chhota Hathi, Pickup, Eicher), and estimate total freight cost per kg.
            </p>
          </div>
        </div>
        <Link
          to={`/freight-calc?origin=${encodeURIComponent(product.location || 'Navsari')}&crop=${encodeURIComponent(product.name)}&qty=${quantity}`}
          className="btn-luxe-harvest text-xs !py-3 !px-5 rounded-xl flex items-center gap-2 shrink-0 shadow-lg font-bold"
        >
          <FaCalculator /> Estimate Delivery Freight →
        </Link>
      </div>

      {/* Verified Customer Reviews & Quality Ratings */}
      <ReviewsSection product={product} />
    </div>
  );
};

export default ProductDetails;
