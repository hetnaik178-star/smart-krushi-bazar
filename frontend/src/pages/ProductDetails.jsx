import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { initiateOrder } from '../services/orderService';
import { addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import { FaMapMarkerAlt, FaUserCheck, FaHeart, FaRegHeart, FaShieldAlt, FaTruck, FaShoppingCart, FaBolt, FaLeaf, FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

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
        <h2 className="text-xl font-bold text-surface-900 mb-2 font-display">Produce Listing Unavailable</h2>
        <p className="text-xs text-surface-500 mb-6">{error || "The produce listing you are looking for has been sold out or removed."}</p>
        <Link to="/products" className="btn-saas-primary text-xs">Browse Fresh Harvest</Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <BackButton fallback="/products" label="Back to Marketplace" />
        {user?.role === 'Buyer' && (
          <button
            onClick={handleWishlistToggle}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm hover:bg-surface-50 transition-all active:scale-95"
          >
            {isWishlisted ? (
              <>
                <FaHeart className="text-red-500" /> <span className="text-red-600">Saved in Wishlist</span>
              </>
            ) : (
              <>
                <FaRegHeart className="text-surface-400" /> <span className="text-surface-600">Add to Wishlist</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 card-saas p-6 sm:p-8 shadow-premium">
        {/* Product Image Showcase */}
        <div className="relative rounded-2xl overflow-hidden bg-emerald-50 aspect-square shadow-sm border border-surface-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-brand-900 shadow-md border border-brand-100 uppercase tracking-wider">
              <FaLeaf className="text-emerald-600 text-[10px]" /> {product.category || 'Produce'}
            </span>
          </div>
        </div>

        {/* Product Details Information */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 font-display mb-2">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mb-4 font-medium">
              <span className="flex items-center gap-1 text-surface-700">
                <FaMapMarkerAlt className="text-emerald-600" /> {product.location || 'Gujarat'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-brand-800">
                <FaUserCheck className="text-emerald-600" /> {product.farmerId?.name || 'Verified Farmer'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed mb-6">
              {product.description || "Farm-fresh organic produce grown with sustainable agricultural practices and harvested directly for this order."}
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
                  {isOutOfStock ? 'Out of Stock' : `${product.quantity} units in stock`}
                </span>
              </div>
            </div>

            {/* Direct Trade Guarantee Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl text-surface-700 font-bold border border-surface-200">
                <FaShieldAlt className="text-emerald-600 text-base shrink-0" /> 0% Middleman Loss
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl text-surface-700 font-bold border border-surface-200">
                <FaTruck className="text-harvest-600 text-base shrink-0" /> Farm Direct Dispatch
              </div>
            </div>
          </div>

          {/* Action Section for Buyers */}
          {user?.role === 'Buyer' && !isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-surface-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-surface-700 uppercase tracking-wider">Purchase Quantity:</label>
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
                  <FaShoppingCart className="text-xs text-surface-600" /> Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaBolt className="text-xs text-harvest-300" /> {buying ? 'Initiating…' : `Buy Now • ₹${product.price * (Number(quantity) || 1)}`}
                </button>
              </div>
            </div>
          )}

          {!user && !isOutOfStock && (
            <div className="pt-4 border-t border-surface-100">
              <Link to="/login" className="block w-full text-center btn-saas-primary text-xs !py-3.5">
                Login as Buyer to Purchase
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Farmer Profile Card Section */}
      {product.farmerId && (
        <div className="mt-8 card-saas p-6 sm:p-7 shadow-premium">
          <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4 font-display">Farmer & Producer Profile</h3>
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
                  View All Crops by this Farmer →
                </Link>
                {user && user.role === 'Buyer' && (
                  <Link
                    to={`/chat?receiverId=${product.farmerId._id || product.farmerId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-700 hover:text-brand-800"
                  >
                    <FaComments className="text-brand-600" /> Chat with Farmer
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
