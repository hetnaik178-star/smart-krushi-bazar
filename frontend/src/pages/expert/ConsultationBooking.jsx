import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from '../../services/paymentService';
import { loadRazorpayScript } from '../../utils/razorpay';
import SmartImage from '../../components/SmartImage';
import BackButton from '../../components/BackButton';
import {
  FaCheckCircle,
  FaLock,
  FaSpinner,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaTimesCircle,
  FaShieldAlt,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ConsultationBooking = () => {
  const { expertId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [expert, setExpert] = useState(null);
  const [formData, setFormData] = useState({ date: '', timeSlot: '', problemDescription: '', imageUrl: '' });
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [consultationId, setConsultationId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mockSimulator, setMockSimulator] = useState({ open: false, data: null });

  // Load expert on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/experts/${expertId}`)
      .then(r => {
        const exp = r.data?.data || r.data;
        if (!exp || !exp._id) {
          throw new Error('Expert details not found');
        }
        setExpert(exp);
        if (exp?.availableSlots?.length > 0) {
          setFormData(f => ({ ...f, timeSlot: exp.availableSlots[0] }));
        } else {
          setFormData(f => ({ ...f, timeSlot: '10:00 AM - 11:00 AM' }));
        }
      })
      .catch(() => toast.error('Expert profile not found'));
  }, [expertId]);

  const fee = expert
    ? (expert.consultationFee !== undefined && expert.consultationFee !== null
        ? Number(expert.consultationFee)
        : (expert.fee !== undefined ? Number(expert.fee) : 0))
    : 0;

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login as Farmer to book a consultation');
      return navigate('/login');
    }
    if (user.role !== 'Farmer') {
      toast.error('Only farmers can book consultations');
      return;
    }
    if (!expert || !expert._id) {
      toast.error('Expert details are still loading. Please try again.');
      return;
    }
    if (!formData.date || !formData.timeSlot || !formData.problemDescription.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/consultations`,
        {
          expertId: expert._id,
          date: formData.date,
          timeSlot: formData.timeSlot,
          problemDescription: formData.problemDescription.trim(),
          imageUrl: formData.imageUrl || null,
          paymentMethod: 'Razorpay',
          paymentStatus: fee === 0 ? 'Free' : 'Pending'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const createdId = data.data?._id || data._id;
      setConsultationId(createdId);

      if (fee === 0) {
        setStep('success');
        toast.success('Free consultation session confirmed! 🎉');
      } else {
        setStep('payment'); // Move to payment screen
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create consultation request');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const payData = await createRazorpayOrder({
        type: 'consultation',
        consultationId,
        paymentMethod: 'Razorpay'
      });

      // Simulator mode fallback when keys are absent
      if (payData.isMock || !payData.keyId || payData.keyId.includes('placeholder') || payData.keyId.includes('simulator')) {
        setProcessing(false);
        setMockSimulator({ open: true, data: payData });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setProcessing(false);
        setMockSimulator({ open: true, data: payData });
        return;
      }

      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: 'Smart Krushi Bazar',
        description: `Consultation with ${expert?.name}`,
        order_id: payData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#047857' },
        handler: async (response) => {
          try {
            await verifyPayment({ ...response, paymentId: payData.paymentId });
            setStep('success');
            toast.success('Payment verified! Consultation session confirmed.');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setProcessing(false)
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        reportPaymentFailure({ paymentId: payData.paymentId, error: resp.error });
        toast.error(resp.error?.description || 'Payment was not completed');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  const handleSimulatedSuccess = async () => {
    const { data } = mockSimulator;
    setMockSimulator({ open: false, data: null });
    setProcessing(true);
    try {
      await verifyPayment({
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`,
        paymentId: data.paymentId,
        isMock: true
      });
      setStep('success');
      toast.success('Test payment verified! Consultation confirmed.');
    } catch (err) {
      toast.error('Test verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulatedCancel = async () => {
    const { data } = mockSimulator;
    setMockSimulator({ open: false, data: null });
    try {
      await reportPaymentFailure({
        paymentId: data.paymentId,
        error: { description: 'Cancelled in test simulator' }
      });
    } catch (e) {}
    toast.error('Payment cancelled');
  };

  if (!expert) {
    return <div className="p-12 text-center text-xs text-surface-500 font-semibold">Loading specialist profile...</div>;
  }

  // ============ SUCCESS SCREEN ============
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center page-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-4xl text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 font-display mb-3">Consultation Confirmed!</h1>
        <p className="text-surface-500 mb-2 text-sm">
          Your diagnostic advisory session with <strong>{expert.name}</strong> has been registered.
        </p>
        <p className="text-xs text-surface-500 mb-8 font-medium">
          📅 {new Date(formData.date).toLocaleDateString()} at {formData.timeSlot}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/farmer/consultations" className="btn-saas-secondary text-xs">View My Consultations</Link>
          <Link to={`/chat?receiverId=${expert._id}`} className="btn-saas-primary text-xs">Message Expert</Link>
        </div>
      </div>
    );
  }

  // ============ PAYMENT SCREEN ============
  if (step === 'payment') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 page-fade-in">
        <div className="mb-6">
          <button onClick={() => setStep('form')} className="btn-saas-secondary text-xs">
            ← Back to Appointment Details
          </button>
        </div>

        <h1 className="text-2xl font-bold text-surface-900 font-display mb-2">Confirm & Pay Session Fee</h1>
        <p className="text-xs text-surface-500 mb-8">Secure your slot with expert agronomy specialist</p>

        <div className="card-saas p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-surface-100">
            <SmartImage src={expert.profileImage} alt={expert.name} className="w-16 h-16 rounded-2xl object-cover border border-surface-200" />
            <div>
              <p className="font-bold text-surface-900 text-sm">{expert.name}</p>
              <p className="text-xs text-surface-500">{expert.specialization || expert.qualification}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-surface-50 p-4 rounded-xl border border-surface-200">
            <div>
              <p className="text-surface-500 mb-1">Appointment Date</p>
              <p className="font-bold text-surface-900 flex items-center gap-1.5">
                <FaCalendarAlt className="text-brand-600" /> {new Date(formData.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-surface-500 mb-1">Preferred Time</p>
              <p className="font-bold text-surface-900 flex items-center gap-1.5">
                <FaClock className="text-brand-600" /> {formData.timeSlot}
              </p>
            </div>
          </div>

          <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-5">
            <p className="text-xs text-brand-800 font-semibold mb-1">Total Consultation Fee</p>
            <p className="text-3xl font-black text-brand-900 font-display flex items-center gap-1">
              ₹{fee}
            </p>
          </div>

          <button
            onClick={handlePayNow}
            disabled={processing}
            className="w-full btn-saas-primary !py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 text-sm font-bold"
          >
            {processing ? <><FaSpinner className="animate-spin" /> Processing Payment…</>
                       : <><FaLock /> Pay ₹{fee} & Confirm Session</>}
          </button>
          <p className="text-[11px] text-surface-400 text-center flex items-center justify-center gap-1">
            <FaShieldAlt /> Secured by 256-bit Razorpay Verification
          </p>
        </div>

        {/* Simulator Modal for Local Test Mode */}
        {mockSimulator.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-md overflow-hidden animate-scale-up">
              <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black text-lg">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">Razorpay Gateway</h3>
                      <span className="bg-amber-400 text-surface-900 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">Test Mode</span>
                    </div>
                    <p className="text-[11px] text-blue-200/80">Consultation with {expert.name}</p>
                  </div>
                </div>
                <button onClick={handleSimulatedCancel} className="text-white/60 hover:text-white p-1 rounded-lg">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-surface-500 uppercase font-semibold">Consultation Fee</p>
                    <p className="text-2xl font-black text-surface-900">₹{fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-surface-500">Order ID</p>
                    <p className="font-mono text-xs text-surface-700 font-semibold truncate max-w-[120px]">{mockSimulator.data?.razorpayOrderId}</p>
                  </div>
                </div>

                <div className="text-xs text-surface-600 bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 flex items-start gap-2.5">
                  <FaInfoCircle className="text-blue-600 text-sm shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Test Mode Simulator Active:</strong> Simulate successful fee settlement to verify consultation confirmation.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleSimulatedSuccess}
                    className="w-full bg-[#0c2340] hover:bg-[#15345c] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle className="text-emerald-400" />
                    Simulate Successful Payment (₹{fee})
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
  }

  // ============ FORM SCREEN ============
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 page-fade-in">
      <div className="mb-6">
        <BackButton fallback="/experts" label="Back to Specialists" />
      </div>

      <h1 className="text-2xl font-bold text-surface-900 font-display mb-1">Book Consultation Session</h1>
      <p className="text-xs text-surface-500 mb-8">
        Specialist: <strong>{expert.name}</strong> • Fee: <span className="font-bold text-brand-800">{fee === 0 ? 'FREE' : `₹${fee}`}</span>
      </p>

      <form onSubmit={handleSubmitForm} className="card-saas p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1 uppercase tracking-wider">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="input-saas text-xs"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1 uppercase tracking-wider">Time Slot *</label>
            <select
              value={formData.timeSlot}
              onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
              className="input-saas text-xs"
              required
            >
              <option value="">Select slot</option>
              {(expert.availableSlots?.length > 0
                ? expert.availableSlots
                : ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM']
              ).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-surface-700 mb-1 uppercase tracking-wider">Describe Your Crop Issue *</label>
          <textarea
            rows="4"
            value={formData.problemDescription}
            onChange={e => setFormData({ ...formData, problemDescription: e.target.value })}
            className="input-saas text-xs"
            placeholder="Describe crop variety, symptoms, affected area, soil conditions..."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-surface-700 mb-1 uppercase tracking-wider">Crop Image URL (Optional)</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            className="input-saas text-xs"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={processing || !expert}
          className="w-full btn-saas-primary !py-3 text-xs font-bold disabled:opacity-60"
        >
          {processing
            ? 'Saving appointment…'
            : !expert
            ? 'Loading Specialist Details…'
            : fee === 0
            ? 'Confirm Free Appointment →'
            : `Continue to Payment (₹${fee}) →`}
        </button>
      </form>
    </div>
  );
};

export default ConsultationBooking;
