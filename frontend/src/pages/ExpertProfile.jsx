import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getExpertById, bookConsultation } from '../services/api';
import { createRazorpayOrder, verifyPayment, reportPaymentFailure } from '../services/paymentService';
import { loadRazorpayScript } from '../utils/razorpay';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import BackButton from '../components/BackButton';
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaComments,
  FaStar,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaShieldAlt,
  FaGraduationCap,
  FaAward,
  FaMapMarkerAlt,
  FaLock,
  FaSpinner,
  FaRupeeSign,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ExpertProfile = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 3-Step Booking States: 'form' | 'summary' | 'success'
  const [step, setStep] = useState('form');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [booking, setBooking] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const [mockSimulator, setMockSimulator] = useState({ open: false, data: null });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getExpertById(id)
      .then((res) => {
        // Robust unwrapping to handle { success, data: expert } or direct expert object
        const expertData = res?.data || res;
        if (!expertData || !expertData._id) {
          throw new Error('Expert details not found');
        }
        setExpert(expertData);
        if (expertData.availableSlots && expertData.availableSlots.length > 0) {
          setTimeSlot(expertData.availableSlots[0]);
        } else {
          setTimeSlot('10:00 AM - 11:00 AM');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load expert:', err);
        setError('Expert profile not found');
        setLoading(false);
      });
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Crop photo size must be less than 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Safe fee resolution — prevents any ₹undefined display
  const fee = expert
    ? (expert.consultationFee !== undefined && expert.consultationFee !== null
        ? Number(expert.consultationFee)
        : (expert.fee !== undefined ? Number(expert.fee) : 0))
    : 0;

  // STEP 1: Submit Form to initiate consultation request
  const handleProceedToSummary = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login as Farmer to book an expert consultation');
      navigate('/login');
      return;
    }
    if (user.role !== 'Farmer') {
      toast.error('Only farmers can book agricultural consultations');
      return;
    }
    if (!expert || !expert._id) {
      toast.error('Specialist details are still loading. Please try again.');
      return;
    }
    if (!date) {
      toast.error('Please select an appointment date');
      return;
    }
    if (!problemDescription.trim()) {
      toast.error('Please describe your crop issue or symptoms');
      return;
    }

    try {
      setBooking(true);
      const formData = new FormData();
      formData.append('expertId', expert._id);
      formData.append('date', date);
      formData.append('timeSlot', timeSlot || '10:00 AM - 11:00 AM');
      formData.append('problemDescription', problemDescription.trim());
      formData.append('paymentMethod', 'Razorpay');
      formData.append('paymentStatus', fee === 0 ? 'Free' : 'Pending');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await bookConsultation(formData);
      if (res.success || res.data) {
        const createdId = res.data?._id || res._id;
        setConsultationId(createdId);

        if (fee === 0) {
          setStep('success');
          toast.success('Free consultation session confirmed! 🎉');
        } else {
          setStep('summary'); // Move to Step 2: Payment Summary Screen
        }
      } else {
        throw new Error(res.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Consultation booking error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to book consultation';
      toast.error(errorMsg);
    } finally {
      setBooking(false);
    }
  };

  // STEP 2: Pay Consultation Fee
  const handlePayNow = async () => {
    setBooking(true);
    try {
      const payData = await createRazorpayOrder({
        type: 'consultation',
        consultationId,
        paymentMethod: 'Razorpay'
      });

      // Simulator mode fallback when keys are absent
      if (payData.isMock || !payData.keyId || payData.keyId.includes('placeholder') || payData.keyId.includes('simulator')) {
        setBooking(false);
        setMockSimulator({ open: true, data: payData });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setBooking(false);
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
            toast.success('Payment verified! Consultation confirmed.');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setBooking(false)
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        reportPaymentFailure({ paymentId: payData.paymentId, error: resp.error });
        toast.error(resp.error?.description || 'Payment was not completed');
        setBooking(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setBooking(false);
    }
  };

  const handleSimulatedSuccess = async () => {
    const { data } = mockSimulator;
    setMockSimulator({ open: false, data: null });
    setBooking(true);
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
      setBooking(false);
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border animate-pulse h-96"></div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
        <FaUserMd className="text-5xl text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-surface-900 mb-2">Expert Not Found</h2>
        <p className="text-xs text-surface-500 mb-6">{error || 'The requested specialist profile is unavailable.'}</p>
        <Link to="/experts" className="btn-saas-primary text-xs hover-glow">Browse All Specialists</Link>
      </div>
    );
  }

  const slots = (expert.availableSlots && expert.availableSlots.length > 0)
    ? expert.availableSlots
    : ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM'];

  // Helper for Stepper Component
  const renderStepper = () => (
    <div className="mb-10 max-w-sm mx-auto animate-fade-in">
      <div className="flex items-center justify-center">
        <div className={`step-indicator ${step === 'form' ? 'active' : 'completed'}`}>1</div>
        <div className={`step-connector ${step === 'payment' || step === 'success' ? 'completed' : ''}`}></div>
        <div className={`step-indicator ${step === 'payment' ? 'active' : step === 'success' ? 'completed' : 'pending'}`}>2</div>
        <div className={`step-connector ${step === 'success' ? 'completed' : ''}`}></div>
        <div className={`step-indicator ${step === 'success' ? 'completed' : 'pending'}`}>3</div>
      </div>
      <div className="flex justify-between px-2 mt-2 text-[10px] font-bold uppercase tracking-wider text-surface-400">
        <span className={step === 'form' ? 'text-brand-700' : step === 'payment' || step === 'success' ? 'text-surface-800' : ''}>Schedule</span>
        <span className={step === 'payment' ? 'text-brand-700' : step === 'success' ? 'text-surface-800' : ''}>Payment</span>
        <span className={step === 'success' ? 'text-brand-700' : ''}>Confirmed</span>
      </div>
    </div>
  );

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <BackButton fallback="/experts" label="Back to Specialists" />
        {user && user.role !== 'Expert' && (
          <Link
            to={`/chat?receiverId=${expert._id}`}
            className="btn-saas-secondary text-xs flex items-center gap-1.5 hover-glow"
          >
            <FaComments className="text-xs text-brand-700" /> Message Specialist
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Expert Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-saas p-6 text-center animate-slide-up">
            <div className="mx-auto w-24 h-24 mb-4 relative animate-scale-in">
              <Avatar src={expert.profileImage} name={expert.name} size="xl" />
              <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-1.5 rounded-full ring-2 ring-white">
                <FaShieldAlt size={12} />
              </div>
            </div>

            <h1 className="text-xl font-bold text-surface-900 font-display mb-1">{expert.name}</h1>
            <p className="text-xs font-semibold text-brand-800 mb-2">{expert.specialization || 'Agronomy Specialist'}</p>
            <div className="flex justify-center mb-4">
              <RoleBadge role="Expert" size="sm" />
            </div>

            <div className="border-t border-surface-100 pt-4 text-left space-y-3 stagger-1">
              {expert.qualification && (
                <div className="flex items-start gap-2.5 text-xs text-surface-600">
                  <FaGraduationCap className="text-brand-600 mt-0.5 shrink-0 text-sm" />
                  <div>
                    <span className="font-semibold text-surface-900 block">Qualification</span>
                    <span>{expert.qualification}</span>
                  </div>
                </div>
              )}

              {expert.experienceYears !== undefined && (
                <div className="flex items-start gap-2.5 text-xs text-surface-600">
                  <FaAward className="text-harvest-600 mt-0.5 shrink-0 text-sm" />
                  <div>
                    <span className="font-semibold text-surface-900 block">Experience</span>
                    <span>{expert.experienceYears} Years in Field Advisory</span>
                  </div>
                </div>
              )}

              {expert.location && (
                <div className="flex items-start gap-2.5 text-xs text-surface-600">
                  <FaMapMarkerAlt className="text-red-500 mt-0.5 shrink-0 text-sm" />
                  <div>
                    <span className="font-semibold text-surface-900 block">Location</span>
                    <span>{expert.location}</span>
                  </div>
                </div>
              )}
            </div>

            {expert.bio && (
              <div className="mt-4 pt-4 border-t border-surface-100 text-left stagger-2">
                <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider block mb-1">
                  About Specialist
                </span>
                <p className="text-xs text-surface-600 leading-relaxed">{expert.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3-Step Consultation Booking & Payment */}
        <div className="lg:col-span-2">
          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="card-saas p-8 text-center space-y-4 animate-scale-in">
              {renderStepper()}
              <div className="animate-celebrate mt-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl animate-success-circle mb-4">
                  <FaCheckCircle />
                </div>
                <h2 className="text-2xl font-bold text-surface-900 font-display">Consultation Confirmed!</h2>
                <p className="text-xs text-surface-600 max-w-md mx-auto">
                  Your consultation appointment with <strong>{expert.name}</strong> has been confirmed.
                </p>
              </div>

              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-left text-xs max-w-md mx-auto space-y-2 animate-slide-up stagger-1">
                <div className="flex justify-between">
                  <span className="text-surface-500">Date:</span>
                  <span className="font-bold text-surface-900">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Time Slot:</span>
                  <span className="font-bold text-surface-900">{timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Fee Status:</span>
                  <span className="font-bold text-emerald-700">✓ {fee === 0 ? 'Free Session' : 'Paid / Confirmed'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center pt-4 animate-slide-up stagger-2">
                <Link to="/farmer/consultations" className="btn-saas-secondary text-xs hover-glow">
                  Go to My Consultations
                </Link>
                <Link to={`/chat?receiverId=${expert._id}`} className="btn-saas-primary text-xs hover-glow">
                  Message Expert
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: SUMMARY & PAY NOW SCREEN */}
          {step === 'summary' && (
            <div className="card-saas p-6 sm:p-8 space-y-6 animate-slide-left">
              {renderStepper()}

              <div className="flex items-center justify-between pb-4 border-b border-surface-100 animate-fade-in-up">
                <div>
                  <h2 className="text-lg font-bold text-surface-900 font-display">Step 2: Consultation Summary & Payment</h2>
                  <p className="text-xs text-surface-500">Review appointment details before proceeding to payment.</p>
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="text-xs font-semibold text-brand-700 hover:underline hover-glow"
                >
                  ← Edit Details
                </button>
              </div>

              <div className="space-y-4 text-xs animate-slide-up stagger-1">
                <div className="grid grid-cols-2 gap-4 bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <div>
                    <span className="text-surface-500 block mb-0.5">Specialist</span>
                    <span className="font-bold text-surface-900">{expert.name}</span>
                  </div>
                  <div>
                    <span className="text-surface-500 block mb-0.5">Specialization</span>
                    <span className="font-semibold text-surface-800">{expert.specialization || 'Agronomy'}</span>
                  </div>
                  <div>
                    <span className="text-surface-500 block mb-0.5">Appointment Date</span>
                    <span className="font-bold text-surface-900 flex items-center gap-1">
                      <FaCalendarAlt className="text-brand-600" /> {new Date(date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-500 block mb-0.5">Time Slot</span>
                    <span className="font-bold text-surface-900 flex items-center gap-1">
                      <FaClock className="text-brand-600" /> {timeSlot}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 animate-slide-up stagger-2">
                  <span className="text-surface-500 block mb-1">Problem Description</span>
                  <p className="text-surface-800 italic leading-relaxed">{problemDescription}</p>
                </div>

                <div className="bg-brand-50/60 p-4 rounded-xl border border-brand-200 flex justify-between items-center animate-scale-in stagger-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-900 block">Total Session Fee</span>
                    <span className="text-[11px] text-surface-500">100% verified advisory session</span>
                  </div>
                  <span className="text-2xl font-black text-brand-900 font-display">₹{fee}</span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={booking}
                className="w-full btn-saas-primary !py-3.5 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 hover-glow animate-slide-up stagger-4 transition-transform active:scale-95"
              >
                {booking ? (
                  <><FaSpinner className="animate-spin" /> Processing Payment…</>
                ) : (
                  <><FaLock /> Pay Now — ₹{fee}</>
                )}
              </button>

              <p className="text-[11px] text-surface-400 text-center flex items-center justify-center gap-1 animate-fade-in-up stagger-5">
                <FaShieldAlt /> 256-bit Secure Razorpay SSL Payment
              </p>
            </div>
          )}

          {/* STEP 1: BOOKING FORM */}
          {step === 'form' && (
            <div className="card-saas p-6 sm:p-8 animate-slide-right">
              {renderStepper()}

              <div className="flex items-center justify-between pb-6 border-b border-surface-100 mb-6 animate-fade-in-up">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-surface-900 font-display">Book Consultation Session</h2>
                  <p className="text-xs text-surface-500 mt-0.5">Select a date and describe your crop or soil issue.</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-surface-400 font-bold uppercase block">Session Fee</span>
                  <span className="text-2xl font-black text-brand-900">
                    {!expert ? '...' : fee === 0 ? 'FREE' : `₹${fee}`}
                  </span>
                </div>
              </div>

              {user?.role === 'Expert' ? (
                <div className="p-8 text-center bg-surface-50 rounded-2xl border border-surface-200 animate-scale-in">
                  <FaUserMd className="text-4xl text-brand-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-surface-900 mb-1">Expert Profile Preview</h3>
                  <p className="text-xs text-surface-500 mb-4">
                    This is how your consultation profile is presented to farmers and buyers on Smart Krushi Bazar.
                  </p>
                  <Link to="/expert/dashboard" className="btn-saas-primary text-xs hover-glow">
                    Back to Expert Dashboard
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleProceedToSummary} className="space-y-5">
                  <div className="animate-slide-up stagger-1">
                    <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                      <FaCalendarAlt className="inline mr-1.5 text-brand-600" /> Appointment Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="input-saas text-xs"
                    />
                  </div>

                  <div className="animate-slide-up stagger-2">
                    <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                      <FaClock className="inline mr-1.5 text-brand-600" /> Preferred Time Slot *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                            timeSlot === slot
                              ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold animate-glow'
                              : 'border-surface-200 hover:border-brand-300 text-surface-700 bg-white'
                          }`}
                        >
                          <span>{slot}</span>
                          {timeSlot === slot && <FaCheckCircle className="text-brand-600 text-xs" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-slide-up stagger-3">
                    <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5">
                      Crop Issue & Symptoms *
                    </label>
                    <textarea
                      rows={4}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      required
                      placeholder="Describe symptoms, affected crop variety, acreage, and any treatments already attempted..."
                      className="input-saas resize-none text-xs"
                    />
                  </div>

                  {/* Crop Photo Attachment (Optional) */}
                  <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-2 animate-slide-up stagger-4">
                    <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FaUpload className="text-brand-700" /> Attach Crop Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-800 hover:file:bg-brand-200 cursor-pointer transition-colors"
                    />

                    {imagePreview ? (
                      <div className="pt-2 flex items-start gap-3 animate-scale-in">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Crop Attachment"
                            className="h-24 w-24 object-cover rounded-xl border border-surface-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 transition-colors"
                            title="Remove photo"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                        <div className="text-xs text-surface-600 pt-1">
                          <p className="font-bold text-surface-900 truncate max-w-[200px]">{imageFile?.name}</p>
                          <p className="text-[11px] text-surface-400">{(imageFile?.size / 1024).toFixed(1)} KB</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Ready to upload
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-surface-400 italic">
                        Supported formats: JPG, PNG, WEBP, AVIF (Max 10MB)
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={booking || !expert}
                    className="w-full btn-saas-primary !py-3 text-xs font-bold disabled:opacity-50 hover-glow animate-slide-up stagger-5 transition-transform active:scale-95"
                  >
                    {booking
                      ? 'Saving Appointment Details…'
                      : !expert
                      ? 'Loading Specialist Details…'
                      : fee === 0
                      ? 'Confirm Free Consultation Session'
                      : `Continue to Payment Summary (₹${fee}) →`}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
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
              <button onClick={handleSimulatedCancel} className="text-white/60 hover:text-white p-1 rounded-lg transition-colors">
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
                  className="w-full bg-[#0c2340] hover:bg-[#15345c] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 hover-glow"
                >
                  <FaCheckCircle className="text-emerald-400" />
                  Simulate Successful Payment (₹{fee})
                </button>

                <button
                  onClick={handleSimulatedCancel}
                  className="w-full bg-surface-100 hover:bg-red-50 text-red-600 hover:text-red-700 border border-surface-200 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform active:scale-95"
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

export default ExpertProfile;
