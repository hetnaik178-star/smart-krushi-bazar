import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from '../../services/paymentService';
import { loadRazorpayScript } from '../../utils/razorpay';
import SmartImage from '../../components/SmartImage';
import BackButton from '../../components/BackButton';
import axios from 'axios';
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
  FaBolt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATES = { IDLE: 'idle', PROCESSING: 'processing', VERIFYING: 'verifying', SUCCESS: 'success', FAILED: 'failed' };

const OrderCheckout = () => {
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

  if (state === STATES.SUCCESS) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center page-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <FaCheckCircle className="text-4xl text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-surface-900 font-display mb-3">Order Confirmed!</h1>
        <p className="text-surface-600 mb-8 text-xs sm:text-sm leading-relaxed">
          {paymentMethod === 'Razorpay'
            ? 'Your online payment has been securely verified and the farmer has been notified to dispatch your fresh produce.'
            : 'Your Cash on Delivery order has been registered. You can pay when the produce is delivered.'}
        </p>
        <Link to="/buyer/orders" className="btn-saas-primary text-xs !py-3 !px-6">View My Orders</Link>
      </div>
    );
  }

  const isBusy = state === STATES.PROCESSING || state === STATES.VERIFYING;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 page-fade-in relative">
      <div className="mb-6">
        <BackButton fallback="/products" label="Back to Marketplace" />
      </div>

      <h1 className="page-heading mb-8">Direct Buy Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Item */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">Ordered Harvest Item</h2>
            <div className="flex items-center gap-4">
              <SmartImage
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover border border-surface-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-surface-900 text-sm truncate font-display">{product.name}</p>
                <p className="text-xs text-surface-500 mt-0.5 font-medium">
                  Quantity: {order.quantity} × ₹{order.unitPrice}
                </p>
                <span className="inline-block mt-1 text-[10px] font-extrabold text-brand-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  {product.category || 'Produce'}
                </span>
              </div>
              <p className="font-black text-brand-900 text-lg font-display">₹{order.totalPrice}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">Delivery Address</h2>
            <div className="space-y-2 text-xs text-surface-700 font-medium">
              <p><span className="font-bold text-surface-900">Recipient:</span> {user?.name}</p>
              <p><span className="font-bold text-surface-900">Contact:</span> {user?.phone || 'Not provided'}</p>
              <p><span className="font-bold text-surface-900">Destination:</span> {user?.location || product.location || 'Gujarat, India'}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">Select Payment Mode</h2>
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-brand-600 bg-emerald-50/60 shadow-sm'
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
                      <FaCreditCard className="text-emerald-700" /> Pay Online (Razorpay / UPI / Cards)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-1">Pay securely via UPI, Google Pay, PhonePe, Cards, NetBanking</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-emerald-50/60 shadow-sm'
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
                      <FaMoneyBillWave className="text-harvest-600" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] font-bold text-harvest-800 bg-harvest-100/80 px-2 py-0.5 rounded-full">
                      Pay on Delivery
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-1">Pay directly in cash when produce arrives at your doorstep</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-2">
          <div className="card-saas p-6 space-y-5 sticky top-24 shadow-premium">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-wider font-display">Invoice Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-surface-600 font-medium">
                <span>Produce Price</span>
                <span>₹{order.unitPrice} × {order.quantity}</span>
              </div>
              <div className="flex justify-between text-surface-600 font-medium">
                <span>Subtotal</span>
                <span>₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between text-surface-600 font-medium">
                <span>Delivery Logistics</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="border-t border-surface-200 pt-3 flex justify-between font-bold text-surface-900 text-sm">
                <span>Total Amount Due</span>
                <span className="text-xl font-black text-brand-900 font-display">₹{order.totalPrice}</span>
              </div>
            </div>

            {paymentMethod === 'Razorpay' ? (
              <button
                onClick={handlePayment}
                disabled={isBusy}
                className="w-full btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? (
                  <><FaSpinner className="animate-spin" /> Verifying Payment…</>
                ) : (
                  <><FaLock /> Pay ₹{order.totalPrice} with Razorpay</>
                )}
              </button>
            ) : (
              <button
                onClick={handleCOD}
                disabled={isBusy}
                className="w-full btn-harvest !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? (
                  <><FaSpinner className="animate-spin" /> Registering Order…</>
                ) : (
                  <><FaTruck /> Confirm COD Order (₹{order.totalPrice})</>
                )}
              </button>
            )}

            <p className="text-[11px] text-surface-400 text-center flex items-center justify-center gap-1 font-medium">
              <FaShieldAlt className="text-emerald-600" /> 256-bit Encrypted SSL Direct Settlement
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
