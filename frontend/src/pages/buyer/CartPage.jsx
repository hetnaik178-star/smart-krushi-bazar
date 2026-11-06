import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import BackButton from '../../components/BackButton';
import { FaTrash, FaShoppingBag, FaArrowRight, FaShieldAlt, FaTruck, FaLeaf } from 'react-icons/fa';

const CartPage = () => {
  const { t } = useLanguage();
  const { cart, loading, updateQuantity, removeFromCart, totalItems, totalPrice } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-saas h-28 skeleton-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = cart.items || [];

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <BackButton fallback="/products" label={t('productDetails.backToMarket', 'Back to Marketplace')} />
      </div>

      <h1 className="page-heading mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
        <FaShoppingBag className="text-brand-700" /> {t('buyer.cartTitle', 'Shopping Cart')}
        <span className="text-xs font-bold text-surface-500 bg-surface-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-surface-200">
          {totalItems} {t('common.items', 'items')}
        </span>
      </h1>

      {items.length === 0 ? (
        <div className="card-saas text-center py-12 sm:py-16 p-6 sm:p-8">
          <FaShoppingBag className="text-4xl sm:text-5xl text-emerald-200 mx-auto mb-3" />
          <h2 className="card-heading text-base sm:text-lg mb-1 font-display">{t('buyer.cartEmpty', 'Your Cart is Currently Empty')}</h2>
          <p className="text-xs text-surface-500 mb-6 max-w-md mx-auto font-medium">
            {t('buyer.cartEmptyDesc', 'Discover freshly harvested crops directly from certified local farmers with 0% middleman markup.')}
          </p>
          <Link to="/products" className="btn-saas-primary text-xs !py-2.5 !px-6 shadow-sm">
            {t('buyer.browseMarket', 'Explore Marketplace')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item, idx) => {
              const product = item.productId || {};
              const price = product.price || item.price || 0;
              return (
                <div key={item._id} className={`card-saas p-3 sm:p-5 flex flex-row items-center gap-3 sm:gap-4 hover:border-emerald-300 animate-slide-up stagger-${(idx % 8) + 1}`}>
                  <img
                    src={product.image || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl sm:rounded-2xl border border-surface-200 flex-shrink-0 shadow-sm"
                  />

                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-brand-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {product.category || 'Farm Produce'}
                    </span>
                    <h3 className="font-bold text-surface-900 text-xs sm:text-base truncate mt-0.5 sm:mt-1 font-display">{product.name || 'Crop Produce'}</h3>
                    <p className="text-[10px] sm:text-xs text-surface-500 font-medium truncate">{product.location || 'Gujarat Farm'}</p>
                    <p className="text-xs sm:text-sm font-black text-brand-900 mt-0.5 sm:mt-1 font-display">₹{price} <span className="text-[10px] sm:text-xs text-surface-400 font-normal">/ unit</span></p>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                    <div className="flex items-center border border-surface-300 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-black text-brand-900 hover:bg-surface-100 transition-all active:scale-95"
                      >
                        -
                      </button>
                      <span className="w-7 sm:w-10 text-center text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-black text-brand-900 hover:bg-surface-100 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs sm:text-base font-black text-brand-900 font-display">₹{price * item.quantity}</span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-surface-400 hover:text-red-600 text-xs transition-colors p-1 hover:bg-red-50 rounded-lg active:scale-95"
                        title={t('common.delete', 'Remove item')}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="card-saas p-6 space-y-6 self-start shadow-premium animate-slide-up stagger-2">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-wider font-display">{t('buyer.orderSummary', 'Order Summary')}</h2>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between text-surface-600">
                <span>{t('buyer.subtotalAmount', 'Items Subtotal')} ({totalItems})</span>
                <span className="font-bold text-surface-900">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>{t('buyer.deliveryFee', 'Farm Delivery Logistics')}</span>
                <span className="font-bold text-emerald-700">{t('common.free', 'FREE')}</span>
              </div>
              <div className="border-t border-surface-200 pt-3 flex justify-between items-baseline font-bold text-surface-900">
                <span>{t('buyer.grandTotal', 'Total Amount Due')}</span>
                <span className="text-2xl font-black text-brand-900 font-display">₹{totalPrice}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-[11px] font-bold text-amber-800">
              {t('orders.estimatedDispatch', 'Estimated Dispatch: 24-48 Hours')}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-saas-primary text-xs !py-3.5 flex items-center justify-center gap-2 shadow-sm font-bold hover-glow"
            >
              {t('buyer.proceedToCheckout', 'Proceed to Secure Checkout')} <FaArrowRight className="text-xs" />
            </button>

            <div className="space-y-2 pt-2 border-t border-surface-100 text-[11px] text-surface-500 font-medium">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-emerald-600" /> {t('productDetails.zeroMiddleman', 'Direct-from-Farmer Guarantee')}
              </div>
              <div className="flex items-center gap-2">
                <FaTruck className="text-harvest-600" /> {t('productDetails.deliveryInfo', 'Fast Agricultural Dispatch')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
