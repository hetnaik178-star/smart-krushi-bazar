import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from '../../services/paymentService';
import { loadRazorpayScript } from '../../utils/razorpay';
import SmartImage from '../../components/SmartImage';
import BackButton from '../../components/BackButton';
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
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  FAILED: 'failed',
  VERIFY_FAILED: 'verify_failed'
};

const Checkout = () => {
  const { cart, totalPrice, totalItems } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [state, setState] = useState(STATES.IDLE);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Simulator Modal State for Test Mode without live API keys
  const [mockModal, setMockModal] = useState({ open: false, data: null });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center card-saas my-12">
        <h1 className="page-heading mb-3">Your Cart is Empty</h1>
        <p className="text-xs text-surface-500 mb-6">You don't have any farm items in your cart to checkout.</p>
        <Link to="/products" className="btn-saas-primary text-xs">Browse Fresh Harvest</Link>
      </div>
    );
  }

  const handlePayment = async () => {
    setState(STATES.PROCESSING);
    try {
      const data = await createRazorpayOrder({ type: 'cart', paymentMethod: 'Razorpay' });

      // If backend indicates Mock/Simulator mode (no real Razorpay API keys in backend/.env)
      if (data.isMock || !data.keyId || data.keyId.includes('placeholder') || data.keyId.includes('simulator')) {
        setState(STATES.IDLE);
        setMockModal({ open: true, data });
        return;
      }

      // Real Razorpay CDN popup flow
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        // Fallback to interactive test simulator if CDN fails to load
        setState(STATES.IDLE);
        setMockModal({ open: true, data });
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Smart Krushi Bazar',
        description: 'Agricultural Produce Purchase',
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
            toast.success('Payment successful! Order confirmed.');
          } catch (err) {
            setState(STATES.VERIFY_FAILED);
            toast.error('Payment verification failed.');
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
        toast.error(resp.error?.description || 'Payment was not completed.');
      });
      rzp.open();
    } catch (err) {
      setState(STATES.FAILED);
      toast.error(err.response?.data?.message || 'Could not initiate payment.');
    }
  };

  // Handler for Interactive Mock Test Mode Modal
  const handleMockSuccess = async () => {
    const { data } = mockModal;
    setMockModal({ open: false, data: null });
    setState(STATES.VERIFYING);
    try {
      const mockPaymentId = `pay_sim_${Date.now()}`;
      await verifyPayment({
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: `sig_sim_${Date.now()}`,
        paymentId: data.paymentId,
        isMock: true
      });
      setState(STATES.SUCCESS);
      toast.success('Test payment verified! Order placed successfully.');
    } catch (err) {
      setState(STATES.VERIFY_FAILED);
      toast.error('Test payment verification failed.');
    }
  };

  const handleMockFailure = async () => {
    const { data } = mockModal;
    setMockModal({ open: false, data: null });
    setState(STATES.FAILED);
    try {
      await reportPaymentFailure({
        paymentId: data.paymentId,
        error: { description: 'User simulated failure in test mode' }
      });
    } catch (e) {}
    toast.error('Payment simulation cancelled or failed.');
  };

  const handleCOD = async () => {
    setState(STATES.PROCESSING);
    try {
      await createRazorpayOrder({ type: 'cart', paymentMethod: 'COD' });
      setState(STATES.SUCCESS);
      toast.success('COD order placed successfully!');
    } catch (err) {
      setState(STATES.FAILED);
      toast.error(err.response?.data?.message || 'Failed to place COD order');
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
            ? 'Your online payment has been securely verified and your order has been dispatched to the farmer.'
            : 'Your Cash on Delivery order has been registered. You can pay when the produce is delivered.'}
        </p>
        <Link to="/buyer/orders" className="btn-saas-primary text-xs !py-3 !px-6">View My Orders</Link>
      </div>
    );
  }

  const isBusy = state === STATES.PROCESSING || state === STATES.VERIFYING;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 page-fade-in relative">
      <div className="mb-6">
        <BackButton fallback="/cart" label="Back to Cart" />
      </div>

      <h1 className="page-heading mb-8">Cart Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Summary */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">
              Cart Items ({totalItems})
            </h2>
            <div className="space-y-3">
              {cart.items.map(item => (
                <div key={item._id} className="flex items-center gap-4 pb-3 border-b border-surface-100 last:border-0">
                  <SmartImage src={item.productId?.image} alt={item.productId?.name} className="w-16 h-16 rounded-xl object-cover border border-surface-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-surface-900 text-sm truncate font-display">{item.productId?.name}</p>
                    <p className="text-xs text-surface-500 font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-black text-brand-900 text-base font-display">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">Delivery Address</h2>
            <div className="space-y-2 text-xs text-surface-700 font-medium">
              <p><span className="font-bold text-surface-900">Recipient:</span> {user?.name}</p>
              <p><span className="font-bold text-surface-900">Contact:</span> {user?.phone || 'Not provided'}</p>
              <p><span className="font-bold text-surface-900">Destination:</span> {user?.location || 'Gujarat, India'}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card-saas p-6">
            <h2 className="font-bold text-surface-900 mb-4 text-xs uppercase tracking-wider font-display">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-brand-600 bg-emerald-50/60 shadow-sm' : 'border-surface-200 hover:border-surface-300 bg-white'}`}>
                <input type="radio" name="pm" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} className="mt-0.5 text-brand-600 focus:ring-brand-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-surface-900 text-xs flex items-center gap-1.5 font-display">
                      <FaCreditCard className="text-emerald-700" /> Pay Online (Razorpay / UPI)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">INSTANT</span>
                  </div>
                  <p className="text-[11px] text-surface-500">UPI, Cards, NetBanking, Instant Order Placement</p>
                </div>
              </label>
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-brand-600 bg-emerald-50/60 shadow-sm' : 'border-surface-200 hover:border-surface-300 bg-white'}`}>
                <input type="radio" name="pm" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mt-0.5 text-brand-600 focus:ring-brand-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-surface-900 text-xs flex items-center gap-1.5 font-display">
                      <FaMoneyBillWave className="text-harvest-600" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-harvest-100 text-harvest-800 px-2 py-0.5 rounded-full font-bold">PAY AT DOOR</span>
                  </div>
                  <p className="text-[11px] text-surface-500">Pay directly when fresh farm items arrive</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Payment Panel */}
        <div className="lg:col-span-2">
          <div className="card-saas p-6 sticky top-24 shadow-premium space-y-5">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-wider font-display">Invoice Summary</h2>
            <div className="space-y-2.5 text-xs pb-4 border-b border-surface-200 font-medium">
              <div className="flex justify-between text-surface-600"><span>Cart Subtotal</span><span>₹{totalPrice}</span></div>
              <div className="flex justify-between text-surface-600"><span>Direct Farm Logistics</span><span className="text-emerald-700 font-bold">FREE</span></div>
            </div>
            <div className="flex justify-between items-baseline mt-4 mb-4">
              <span className="font-bold text-surface-900 text-sm">Total Payable</span>
              <span className="text-2xl font-black text-brand-900 font-display">₹{totalPrice}</span>
            </div>

            {paymentMethod === 'Razorpay' ? (
              <button
                onClick={handlePayment}
                disabled={isBusy}
                className="w-full btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? <><FaSpinner className="animate-spin" /> Processing Payment…</> : <><FaLock /> Pay ₹{totalPrice} with Razorpay</>}
              </button>
            ) : (
              <button
                onClick={handleCOD}
                disabled={isBusy}
                className="w-full btn-harvest !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isBusy ? <><FaSpinner className="animate-spin" /> Confirming…</> : <><FaTruck /> Confirm COD Order (₹{totalPrice})</>}
              </button>
            )}

            <p className="text-[11px] text-surface-400 text-center flex items-center justify-center gap-1 font-medium">
              <FaShieldAlt className="text-emerald-600" /> 100% Direct Farmer Payment Guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Modal for Local Test Mode */}
      {mockModal.open && (
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
                  <p className="text-[11px] text-blue-200/80">{totalItems} Produce Items</p>
                </div>
              </div>
              <button onClick={handleMockFailure} className="text-white/60 hover:text-white p-1 rounded-lg">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-surface-500 uppercase font-bold">Total Amount</p>
                  <p className="text-2xl font-black text-surface-900 font-display">₹{totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-surface-500 font-medium">Order ID</p>
                  <p className="font-mono text-xs text-surface-700 font-bold truncate max-w-[120px]">{mockModal.data?.razorpayOrderId}</p>
                </div>
              </div>

              <div className="text-xs text-surface-600 bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60 flex items-start gap-2.5">
                <FaInfoCircle className="text-blue-600 text-sm shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  <strong>Test Mode Simulator Active:</strong> Simulate instant payment confirmation without real cards.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleMockSuccess}
                  className="w-full bg-[#0c2340] hover:bg-[#15345c] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="text-emerald-400" />
                  Simulate Successful Payment (₹{totalPrice})
                </button>

                <button
                  onClick={handleMockFailure}
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

export default Checkout;
