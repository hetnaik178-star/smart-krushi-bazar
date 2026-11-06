import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import OrderTrackingStepper from '../../components/OrderTrackingStepper';
import ReviewModal from '../../components/ReviewModal';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';
import { resolveProduceImage, resolveFarmPhoto } from '../../utils/produceTraceability';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FaBoxOpen, FaTruck, FaClock, FaCheckCircle, FaTimesCircle, 
  FaFileDownload, FaUser, FaMapMarkerAlt, FaShieldAlt, FaStar, FaSpinner 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentBadge = ({ order }) => {
  const { t } = useLanguage();
  if (order.paymentMethod === 'COD' || (!order.razorpayPaymentId && order.paymentStatus === 'Pending')) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
        <FaClock className="text-[10px] text-amber-600" />
        <span>{t('orders.cashOnDeliveryBadge', 'Cash on Delivery (Pay on arrival)')}</span>
      </div>
    );
  }
  const isPaid = order.paymentStatus === 'Paid';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
      isPaid ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
    }`}>
      {isPaid ? <FaCheckCircle className="text-[10px] text-emerald-600" /> : <FaTimesCircle className="text-[10px] text-red-600" />}
      <span>{isPaid ? t('orders.verifiedPaid', 'Verified Paid (Online)') : t('orders.paymentPending', 'Payment Pending')}</span>
    </div>
  );
};

const MyOrders = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [generatingPdfId, setGeneratingPdfId] = useState(null);

  const handleDownloadInvoice = async (order) => {
    try {
      setGeneratingPdfId(order._id);
      toast.loading(t('orders.generatingInvoice', 'Preparing invoice with farm photo & QR...'), { id: 'inv-toast' });
      await generateOrderInvoicePDF({
        ...order,
        buyerId: (order.buyerId && typeof order.buyerId === 'object' && order.buyerId.name) ? order.buyerId : (user || order.buyerId)
      });
      toast.success(t('orders.invoiceDownloaded', 'Official Invoice downloaded successfully!'), { id: 'inv-toast', icon: '📄' });
    } catch (err) {
      console.error('Invoice download error:', err);
      toast.error('Failed to generate invoice PDF', { id: 'inv-toast' });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/buyer/dashboard" label={t('nav.dashboard', 'Back to Dashboard')} />
      </div>

      <div className="mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2 shadow-sm">
          <FaTruck className="text-brand-600" /> {t('orders.directFarmOrders', 'Direct Farm Orders')}
        </div>
        <h1 className="page-heading flex items-center gap-3">
          {t('orders.title', 'My Crop Purchases & Orders')}
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 font-medium mt-1">
          {t('orders.subtitle', 'Review full transaction history, payment verification, and real-time delivery status.')}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-luxe h-48 skeleton-shimmer"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-luxe p-8">
          <EmptyState
            icon={FaBoxOpen}
            title={t('orders.noOrdersTitle', 'No Orders Yet')}
            description={t('orders.noOrdersDesc', 'You haven’t placed any orders yet. Browse the marketplace to discover freshly harvested crops directly from local farmers.')}
            actionText="Explore Marketplace"
            actionLink="/products"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o, idx) => {
            const farmerName = o.farmerId?.name || 'Verified Kisan Partner';
            const farmerLocation = o.farmerId?.location || 'Gujarat, India';

            return (
              <div 
                key={o._id} 
                className={`card-luxe p-5 sm:p-6 shadow-xl border border-emerald-400/25 animate-slide-up stagger-${(idx % 6) + 1} relative overflow-hidden`}
              >
                {/* Top Strip: Produce Title, Order ID, Date & Payment */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-surface-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-extrabold text-lg text-surface-900">
                        {o.productName}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 font-bold border border-surface-200 font-mono">
                        #{o._id.toString().slice(-6).toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-surface-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-emerald-600 text-[10px]" /> {farmerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-emerald-600 text-[10px]" /> {farmerLocation}
                      </span>
                      <span>•</span>
                      <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <PaymentBadge order={o} />
                  </div>
                  
                  {/* Dual Image Preview: Produce Photo + Real Khet / Farm Field Photo */}
                  {(() => {
                    const produceImg = resolveProduceImage(o);
                    const farmPhotoData = resolveFarmPhoto(o);
                    return (
                      <div className="mt-3 pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                          {/* Produce Image Thumbnail */}
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-surface-200 shrink-0 shadow-sm bg-surface-50 group">
                            <img src={produceImg} alt={o.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5">
                              🌱 Produce
                            </span>
                          </div>

                          {/* Real Farm Field Photo Thumbnail */}
                          <div className="relative w-24 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm group bg-emerald-950">
                            <img 
                              src={farmPhotoData.photo} 
                              alt={farmPhotoData.label} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-900/90 text-white text-[8px] font-extrabold text-center py-0.5 flex items-center justify-center gap-0.5">
                              🌾 खेत फोटो
                            </span>
                          </div>

                          <div className="text-xs">
                            <div className="font-bold text-emerald-800 flex items-center gap-1">
                              <FaShieldAlt className="text-emerald-600 text-[11px]" />
                              <span>Direct Farm Gate Origin Verified</span>
                            </div>
                            <p className="text-[11px] text-surface-700 font-medium mt-0.5 line-clamp-1">
                              {farmPhotoData.label}
                            </p>
                            <p className="text-[10px] text-surface-500">
                              Harvest Date: {new Date(new Date(o.createdAt).getTime() - 2*86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {farmerLocation}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/passport/${o._id}`}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                        >
                          <FaShieldAlt className="text-emerald-600 text-[11px]" />
                          <span>{t('orders.viewPassport', 'Digital Farm Passport')} ➔</span>
                        </Link>
                      </div>
                    );
                  })()}
                </div>

                {/* Middle: Visual Order Tracking Stepper */}
                <div className="py-5 px-1 sm:px-4">
                  <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-3 font-display flex items-center gap-1.5">
                    <FaTruck className="text-emerald-600" />
                    <span>{t('orders.trackingTimeline', 'Live Order Stepper Tracking')}</span>
                  </p>
                  <OrderTrackingStepper order={o} />
                </div>

                {/* Bottom Bar: Quantity, Total & Download Invoice Button */}
                <div className="pt-4 border-t border-surface-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                  <div className="flex flex-wrap items-center gap-5">
                    <div>
                      <span className="text-[10px] text-surface-400 font-bold uppercase block">{t('orders.quantity', 'Quantity')}</span>
                      <span className="text-xs font-bold text-surface-800">{o.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-400 font-bold uppercase block">Produce Price</span>
                      <span className="text-xs font-bold text-surface-800">₹{o.produceAmount || (o.unitPrice * o.quantity)}</span>
                    </div>
                    {o.freightAmount > 0 ? (
                      <div>
                        <span className="text-[10px] text-surface-400 font-bold uppercase block">Farm Freight ({o.vehicleType || 'Commercial'})</span>
                        <span className="text-xs font-bold text-brand-800 flex items-center gap-1">
                          <FaTruck className="text-[10px] text-emerald-600" /> ₹{o.freightAmount}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-surface-400 font-bold uppercase block">Delivery</span>
                        <span className="text-xs font-bold text-emerald-700">Free Retail Farm Express</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-surface-400 font-bold uppercase block">{t('orders.totalAmount', 'Total Paid')}</span>
                      <span className="text-base font-black text-brand-900 font-display">₹{o.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {o.status === 'Completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalProduct({
                            _id: o.productId?._id || o.productId,
                            name: o.productName,
                            price: o.unitPrice,
                            unit: 'kg'
                          });
                          setReviewOrderId(o._id);
                        }}
                        className="btn-saas-secondary text-xs !py-2 !px-3.5 flex items-center justify-center gap-1.5 shadow-sm border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold"
                        title="Rate produce quality & freshness"
                      >
                        <FaStar className="text-amber-500 text-xs" />
                        <span>Rate Harvest</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(o)}
                      disabled={generatingPdfId === o._id}
                      className="btn-luxe-primary text-xs !py-2 !px-4 flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto disabled:opacity-60"
                      title="Download Official A4 PDF Invoice with Farm Photo & Scannable QR"
                    >
                      {generatingPdfId === o._id ? (
                        <>
                          <FaSpinner className="text-xs animate-spin" />
                          <span>Generating Invoice...</span>
                        </>
                      ) : (
                        <>
                          <FaFileDownload className="text-xs" />
                          <span>{t('orders.downloadInvoice', 'Download Invoice')} (रसीद)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal for Buyers */}
      <ReviewModal
        isOpen={Boolean(reviewModalProduct)}
        onClose={() => {
          setReviewModalProduct(null);
          setReviewOrderId(null);
        }}
        product={reviewModalProduct}
        orderId={reviewOrderId}
      />
    </div>
  );
};

export default MyOrders;
