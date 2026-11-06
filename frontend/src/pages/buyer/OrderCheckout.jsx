import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from '../../services/paymentService';
import { loadRazorpayScript } from '../../utils/razorpay';
import SmartImage from '../../components/SmartImage';
import BackButton from '../../components/BackButton';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { calculateOrderFreight } from '../../utils/freightCalculator';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';
import { resolveProduceImage, resolveFarmPhoto } from '../../utils/produceTraceability';
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaLock,
  FaTruck,
  FaCreditCard,
  FaMoneyBillWave,
  FaTimes,
  FaInfoCircle,
  FaLeaf,
  FaBolt,
  FaFileDownload
} from 'react-icons/fa';
import toast from 'react-hot-toast';


const STATES = { IDLE: 'idle', PROCESSING: 'processing', VERIFYING: 'verifying', SUCCESS: 'success', FAILED: 'failed' };

const OrderCheckout = () => {
  const { t } = useLanguage();
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [state, setState] = useState(STATES.IDLE);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [mockSimulator, setMockSimulator] = useState({ open: false, data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderList = Array.isArray(data) ? data : (data.orders || []);
        const found = orderList.find(o => o._id === orderId);
        if (!found) {
          toast.error('Order not found');
          navigate('/products');
          return;
        }
        setOrder(found);
        const prodId = typeof found.productId === 'object' ? found.productId._id : found.productId;
        const pRes = await axios.get(`${API_URL}/products/${prodId}`);
        setProduct(pRes.data);
      } catch (err) {
        toast.error('Failed to load order details');
        navigate('/products');
      }
    };
    load();
  }, [orderId, navigate]);

  if (!order || !product) {
    return <div className="p-16 text-center text-xs text-surface-500 font-bold">Loading secure checkout...</div>;
  }

  const handlePayment = async () => {
    setState(STATES.PROCESSING);
    try {
      const data = await createRazorpayOrder({
        type: 'product',
        orderIds: [order._id],
        paymentMethod: 'Razorpay'
      });

      // Simulator mode fallback when keys are absent
      if (data.isMock || !data.keyId || data.keyId.includes('placeholder') || data.keyId.includes('simulator')) {
        setState(STATES.IDLE);
        setMockSimulator({ open: true, data });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setState(STATES.IDLE);
        setMockSimulator({ open: true, data });
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Smart Krushi Bazar',
        description: `Order: ${product.name}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#047857' },
        handler: async (response) => {
          setState(STATES.VERIFYING);
          try {
            await verifyPayment({ ...response, paymentId: data.paymentId });
            setState(STATES.SUCCESS);
            toast.success('Payment verified! Order confirmed.');
          } catch (err) {
            setState(STATES.FAILED);
            toast.error('Verification failed.');
          }
        },
        modal: {
          ondismiss: () => setState(STATES.IDLE)
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setState(STATES.FAILED);
        reportPaymentFailure({ paymentId: data.paymentId, error: resp.error });
        toast.error(resp.error?.description || 'Payment was not completed');
      });
      rzp.open();
    } catch (err) {
      setState(STATES.FAILED);
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  const handleSimulatedSuccess = async () => {
    const { data } = mockSimulator;
    setMockSimulator({ open: false, data: null });
    setState(STATES.VERIFYING);
    try {
      await verifyPayment({
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`,
        paymentId: data.paymentId,
        isMock: true
      });
      setState(STATES.SUCCESS);
      toast.success('Test payment verified! Order confirmed.');
    } catch (err) {
      setState(STATES.FAILED);
      toast.error('Test verification failed.');
    }
  };

  const handleSimulatedCancel = async () => {
    const { data } = mockSimulator;
    setMockSimulator({ open: false, data: null });
    setState(STATES.FAILED);
    try {
      await reportPaymentFailure({
        paymentId: data.paymentId,
        error: { description: 'Cancelled in test simulator' }
      });
    } catch (e) {}
    toast.error('Payment cancelled');
  };

  const handleCOD = async () => {
    setState(STATES.PROCESSING);
    try {
      await createRazorpayOrder({
        type: 'product',
        orderIds: [order._id],
        paymentMethod: 'COD'
      });
      setState(STATES.SUCCESS);
      toast.success('COD order placed successfully!');
    } catch (err) {
      setState(STATES.FAILED);
      toast.error(err.response?.data?.message || 'Failed to confirm COD order');
    }
  };

  // Calculate freight BEFORE the success screen (variables must be in scope for both render paths)
  const isBusy = state === STATES.PROCESSING || state === STATES.VERIFYING;

  const freightInfo = calculateOrderFreight(
    order.quantity,
    product?.location,
    user?.location,
    product?.category
  );
  const produceAmount = order.produceAmount || (order.unitPrice * order.quantity);
  const freightAmount = order.freightAmount !== undefined ? order.freightAmount : freightInfo.freightAmount;
  const grandTotal = order.totalPrice || (produceAmount + freightAmount);

  if (state === STATES.SUCCESS) {
    const handleInvoiceClick = async () => {
      try {
        toast.loading('Generating official invoice with farm photo & QR...', { id: 'inv-dl' });
        await generateOrderInvoicePDF({
          ...order,
          productId: product,
          farmerId: product?.farmerId,
          buyerId: user,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'Razorpay' ? 'Paid' : 'Pending',
          freightAmount: freightAmount,
          vehicleType: freightInfo.vehicleName,
          totalPrice: grandTotal
        });
        toast.success('Official Invoice downloaded successfully! 📄', { id: 'inv-dl' });
      } catch (e) {
        console.error('Invoice error:', e);
        toast.error('Failed to generate invoice', { id: 'inv-dl' });
      }
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center page-fade-in animate-celebrate">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-success-circle">
          <FaCheckCircle className="text-4xl text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-surface-900 font-display mb-2">
          {t('orders.orderConfirmed', 'Order Confirmed & Verified!')}
        </h1>
        <p className="text-surface-600 mb-6 text-xs sm:text-sm leading-relaxed">
          {paymentMethod === 'Razorpay'
            ? 'Your online payment has been securely verified. The farmer has received dispatch notification for fresh harvest.'
            : 'Your Cash on Delivery order has been registered. You can pay when the produce is delivered.'}
        </p>

        {/* Order & Farm Origin Summary Card */}
        <div className="card-luxe p-5 text-left mb-6 border border-emerald-300 shadow-md bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between pb-3 border-b border-surface-200">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Direct Farm Harvest Order
              </span>
              <h3 className="font-display font-extrabold text-base text-surface-900">
                {product?.name || order.productName}
              </h3>
            </div>
            <span className="text-sm font-black text-brand-900 font-display">
              ₹{grandTotal}
            </span>
          </div>

          {/* Dual Image Preview: Crop Produce + Farm Photo */}
          {(() => {
            const targetItem = product || order;
            const produceImg = resolveProduceImage(targetItem);
            const farmPhotoData = resolveFarmPhoto(targetItem);
            return (
              <div className="flex items-center gap-3 my-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-200 shadow-sm shrink-0 bg-surface-50">
                  <img src={produceImg} alt={product?.name || order.productName} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5">🌱 Produce</span>
                </div>
                <div className="relative w-24 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-emerald-950">
                  <img src={farmPhotoData.photo} alt={farmPhotoData.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-900/90 text-white text-[8px] font-extrabold text-center py-0.5">🌾 खेत फोटो</span>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <FaShieldAlt className="text-emerald-600 text-[11px]" />
                    <span>Verified Direct Kisan Gate Harvest</span>
                  </div>
                  <p className="text-[11px] text-surface-700 font-semibold mt-0.5">
                    {farmPhotoData.label}
                  </p>
                  <p className="text-[10px] text-surface-500">
                    Farmer: {product?.farmerId?.name || 'Het Naik (Kisan)'} • {product?.location || 'Navsari, Gujarat'}
                  </p>
                  <p className="text-[10px] text-surface-500">
                    Transport: {freightInfo.vehicleName} {freightAmount > 0 ? `(+₹${freightAmount})` : '(Free Retail Delivery)'}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="pt-3 border-t border-surface-200/80 flex items-center justify-between text-xs font-bold text-surface-600">
            <span>Quantity: {order.quantity} units</span>
            <span>Status: Accepted / Processing</span>
          </div>
        </div>

        {/* Action Buttons: Download PDF & View Passport */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleInvoiceClick}
            className="btn-luxe-primary text-xs !py-3 !px-6 flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
          >
            <FaFileDownload className="text-sm" />
            <span>{t('orders.downloadInvoice', 'Download Official PDF Invoice (रसीद)')}</span>
          </button>

          <Link
            to={`/passport/${order._id}`}
            className="btn-saas-secondary text-xs !py-3 !px-5 flex items-center justify-center gap-1.5 shadow-sm border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold w-full sm:w-auto"
          >
            <FaShieldAlt className="text-emerald-600 text-sm" />
            <span>View Digital Farm Passport</span>
          </Link>
        </div>

        <div>
          <Link to="/buyer/orders" className="text-xs font-bold text-surface-500 hover:text-emerald-700 underline">
            {t('orders.viewMyOrders', 'Go to My Orders History')} ➔
          </Link>
        </div>
      </div>
    );
  }


  // Derive step
  let currentStep = 1;
  if (state === STATES.SUCCESS) currentStep = 3;
  else if (state !== STATES.IDLE) currentStep = 2;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 page-fade-in relative">
      <div className="mb-6">
        <BackButton fallback="/products" label={t('common.backToMarket', 'Back to Marketplace')} />
      </div>

      {/* 3-Step Visual Progress Stepper */}
      <div className="mb-10 flex items-center justify-between max-w-2xl mx-auto relative px-4">
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-surface-200 -z-10 -translate-y-1/2"></div>
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className={`step-indicator ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : 'pending'}`}>1</div>
          <span className="text-[10px] font-bold mt-2 text-surface-700">{t('buyer.orderReview', 'Order Review')}</span>
        </div>
        {/* Connector */}
        <div className={`step-connector flex-1 mx-2 h-0.5 ${currentStep >= 2 ? 'completed' : 'bg-surface-200'}`}></div>
        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className={`step-indicator ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : 'pending'}`}>2</div>
          <span className="text-[10px] font-bold mt-2 text-surface-700">{t('buyer.payment', 'Payment')}</span>
        </div>
        {/* Connector */}
        <div className={`step-connector flex-1 mx-2 h-0.5 ${currentStep >= 3 ? 'completed' : 'bg-surface-200'}`}></div>
        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className={`step-indicator ${currentStep === 3 ? 'completed' : 'pending'}`}>3</div>
          <span className="text-[10px] font-bold mt-2 text-surface-700">{t('buyer.confirmed', 'Confirmed')}</span>
        </div>
      </div>

      <h1 className="page-heading mb-8">{t('buyer.directBuyCheckout', 'Direct Buy Checkout')}</h1>

      {/* Bulk Commercial Transport Notice (if >= 40 kg) */}
      {order.quantity >= 40 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex items-start gap-3.5 border border-emerald-500/30 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl text-harvest-300 shrink-0 border border-white/15">
            <FaTruck />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-harvest-300 mb-0.5">
              Wholesale Bulk Order (≥ 40 kg)
            </div>
            <h4 className="text-xs sm:text-sm font-bold font-display text-white">
              Commercial Transport Assigned: {order.vehicleType || freightInfo.vehicleName}
            </h4>
            <p className="text-[11px] text-emerald-100/90 mt-0.5">
              Weight is {order.quantity} kg. Standard dedicated farm-to-door vehicle fare (+₹{freightAmount}) from {freightInfo.origin} to {freightInfo.destination} ({order.deliveryDistanceKm || freightInfo.distanceKm} km) is included in total payment.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Item */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">{t('buyer.orderedHarvestItem', 'Ordered Harvest Item')}</h2>
            <div className="flex items-center gap-4">
              <SmartImage
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover border border-surface-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-surface-900 text-sm truncate font-display">{product.name}</p>
                <p className="text-xs text-surface-500 mt-0.5 font-medium">
                  {t('common.quantity', 'Quantity')}: {order.quantity} × ₹{order.unitPrice}
                </p>
                <span className="inline-block mt-1 text-[10px] font-extrabold text-brand-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  {product.category || 'Produce'}
                </span>
              </div>
              <p className="font-black text-brand-900 text-lg font-display">₹{produceAmount}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">{t('buyer.shippingAddress', 'Delivery Address')}</h2>
            <div className="space-y-2 text-xs text-surface-700 font-medium">
              <p><span className="font-bold text-surface-900">{t('buyer.recipient', 'Recipient:')}</span> {user?.name}</p>
              <p><span className="font-bold text-surface-900">{t('buyer.contact', 'Contact:')}</span> {user?.phone || 'Not provided'}</p>
              <p><span className="font-bold text-surface-900">{t('buyer.destination', 'Destination:')}</span> {user?.location || product.location || 'Gujarat, India'}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">{t('buyer.paymentMode', 'Select Payment Mode')}</h2>
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all hover-glow ${
                  paymentMethod === 'Razorpay'
                    ? 'border-brand-600 bg-emerald-50/60 shadow-sm animate-glow'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-surface-900 flex items-center gap-1.5 font-display">
                      <FaCreditCard className="text-emerald-700" /> {t('buyer.payOnlineTitle', 'Pay Online (Razorpay / UPI / Cards)')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      {t('buyer.instantBadge', 'Instant Confirmation')}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-1">{t('buyer.payOnlineSub', 'Pay securely via UPI, Google Pay, PhonePe, Cards, NetBanking')}</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all hover-glow ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-emerald-50/60 shadow-sm animate-glow'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-surface-900 flex items-center gap-1.5 font-display">
                      <FaMoneyBillWave className="text-harvest-600" /> {t('buyer.codTitle', 'Cash on Delivery (COD)')}
                    </span>
                    <span className="text-[10px] font-bold text-harvest-800 bg-harvest-100/80 px-2 py-0.5 rounded-full">
                      {t('buyer.payAtDoor', 'Pay on Delivery')}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-1">{t('buyer.codSub', 'Pay directly in cash when produce arrives at your doorstep')}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-2">
          <div className="card-saas p-6 space-y-5 sticky top-24 shadow-premium">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-wider font-display">{t('buyer.orderSummary', 'Invoice Summary')}</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-surface-600 font-medium">
                <span>{t('common.price', 'Produce Price')}</span>
                <span>₹{order.unitPrice} × {order.quantity}</span>
              </div>
              <div className="flex justify-between text-surface-600 font-medium">
                <span>{t('buyer.subtotalAmount', 'Produce Subtotal')}</span>
                <span>₹{produceAmount}</span>
              </div>
              <div className="flex justify-between items-center text-surface-600 font-medium">
                <span>{t('buyer.deliveryFee', 'Farm Transport / Logistics')}</span>
                {freightAmount === 0 ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    FREE (Retail &lt; 40 kg)
                  </span>
                ) : (
                  <span className="text-brand-900 font-black text-xs">
                    +₹{freightAmount}
                  </span>
                )}
              </div>

              {/* Commercial Vehicle & Distance Details if bulk order >= 40 kg */}
              {order.quantity >= 40 && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-surface-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-brand-900">
                    <span className="flex items-center gap-1.5">
                      <FaTruck className="text-emerald-600" /> {order.vehicleType || freightInfo.vehicleName}
                    </span>
                    <span className="text-emerald-700 font-extrabold">{order.deliveryDistanceKm || freightInfo.distanceKm} km</span>
                  </div>
                  <p className="text-[10px] text-surface-500">
                    Direct bulk freight ({freightInfo.origin} ➔ {freightInfo.destination}) at ~₹{freightInfo.costPerKg}/kg transport impact.
                  </p>
                </div>
              )}

              <div className="border-t border-surface-200 pt-3 flex justify-between font-bold text-surface-900 text-sm">
                <span>{t('buyer.totalDue', 'Total Amount Due')}</span>
                <span className="text-xl font-black text-brand-900 font-display">₹{grandTotal}</span>
              </div>
            </div>

            {paymentMethod === 'Razorpay' ? (
              <button
                onClick={handlePayment}
                disabled={isBusy}
                className="w-full btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? (
                  <><FaSpinner className="animate-spin" /> {t('common.processing', 'Verifying Payment…')}</>
                ) : (
                  <><FaLock /> Pay ₹{grandTotal} with Razorpay</>
                )}
              </button>
            ) : (
              <button
                onClick={handleCOD}
                disabled={isBusy}
                className="w-full btn-harvest !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? (
                  <><FaSpinner className="animate-spin" /> {t('common.processing', 'Registering Order…')}</>
                ) : (
                  <><FaTruck /> Confirm COD Order (₹{grandTotal})</>
                )}
              </button>
            )}

            <p className="text-[11px] text-surface-400 text-center flex items-center justify-center gap-1 font-medium">
              <FaShieldAlt className="text-emerald-600" /> {t('buyer.sslGuarantee', '256-bit Encrypted SSL Direct Settlement')}
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Modal for Local Test Mode */}
      {mockSimulator.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-surface-200 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black text-lg">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white font-display">Razorpay Gateway</h3>
                    <span className="bg-amber-400 text-surface-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">Test Mode</span>
                  </div>
                  <p className="text-[11px] text-blue-200/80">Order #{orderId.slice(-6)} • {product.name}</p>
                </div>
              </div>
              <button onClick={handleSimulatedCancel} className="text-white/60 hover:text-white p-1 rounded-lg">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-surface-500 uppercase font-bold">Total Amount</p>
                  <p className="text-2xl font-black text-surface-900 font-display">₹{order.totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-surface-500 font-medium">Order ID</p>
                  <p className="font-mono text-xs text-surface-700 font-bold truncate max-w-[120px]">{mockSimulator.data?.razorpayOrderId}</p>
                </div>
              </div>

              <div className="text-xs text-surface-600 bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60 flex items-start gap-2.5">
                <FaInfoCircle className="text-blue-600 text-sm shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Test Mode Simulator Active:</strong> Simulate successful settlement without live API keys.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleSimulatedSuccess}
                  className="w-full bg-[#0c2340] hover:bg-[#15345c] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="text-emerald-400" />
                  Simulate Successful Payment (₹{order.totalPrice})
                </button>

                <button
                  onClick={handleSimulatedCancel}
                  className="w-full bg-surface-100 hover:bg-red-50 text-red-600 hover:text-red-700 border border-surface-200 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaTimesCircle />
                  Simulate Payment Failure / Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCheckout;
