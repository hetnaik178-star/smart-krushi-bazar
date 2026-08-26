import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaSeedling, FaBriefcase, FaRupeeSign, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buyer',
    phone: '',
    location: '',
    qualification: '',
    specialization: '',
    experienceYears: '',
    consultationFee: '',
    availableSlots: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (formData.role === 'Expert') {
        payload.experienceYears = Number(formData.experienceYears) || 0;
        payload.consultationFee = Number(formData.consultationFee) || 0;
        payload.availableSlots = formData.availableSlots
          ? formData.availableSlots.split(',').map(s => s.trim()).filter(Boolean)
          : ['10:00 AM - 11:00 AM', '03:00 PM - 04:00 PM'];
      } else {
        delete payload.qualification;
        delete payload.specialization;
        delete payload.experienceYears;
        delete payload.consultationFee;
        delete payload.availableSlots;
      }

      const data = await registerUser(payload);
      login(data, data.token);
      toast.success(`Welcome to Smart Krushi Bazar, ${data.name}! 🎉`);
      
      if (data.role === 'Farmer') navigate('/farmer/dashboard');
      else if (data.role === 'Expert') navigate('/expert/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 page-fade-in">
      <div className="max-w-2xl w-full glass-card shadow-premium p-8 sm:p-10 border border-surface-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-800 to-emerald-600 text-white rounded-2xl shadow-md shadow-brand-900/20 mb-3 animate-float">
            <FaSeedling size={26} className="text-emerald-100" />
          </div>
          <h1 className="page-heading text-2xl sm:text-3xl font-display">Join Smart Krushi Bazar</h1>
          <p className="text-xs text-surface-500 font-medium mt-1">Create your verified account and access the digital agri-marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2 font-display">Select Your Platform Role</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: 'Buyer', label: '🛒 Buyer', desc: 'Purchase Produce' },
                { role: 'Farmer', label: '🌾 Farmer', desc: 'Sell Farm Crops' },
                { role: 'Expert', label: '👨‍🌾 Expert', desc: 'Agronomy Doctor' }
              ].map(({ role, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`p-3.5 rounded-2xl border-2 font-bold text-xs transition-all text-center ${
                    formData.role === role 
                      ? 'border-brand-700 bg-emerald-50/70 text-brand-900 shadow-sm' 
                      : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-white'
                  }`}
                >
                  <div className="font-display">{label}</div>
                  <div className="text-[10px] font-medium text-surface-400 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputIcon icon={FaUser} name="name" placeholder="Full Legal Name" value={formData.name} onChange={handleChange} required />
            <InputIcon icon={FaEnvelope} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <InputIcon icon={FaLock} name="password" type="password" placeholder="Password (Min 6 chars)" value={formData.password} onChange={handleChange} required />
            <InputIcon icon={FaPhone} name="phone" placeholder="Mobile Contact Number" value={formData.phone} onChange={handleChange} required />
            <div className="md:col-span-2">
              <InputIcon icon={FaMapMarkerAlt} name="location" placeholder="City / District / State (e.g. Navsari, Gujarat)" value={formData.location} onChange={handleChange} required />
            </div>
          </div>

          {/* Expert Specific Fields (Animated Reveal) */}
          {formData.role === 'Expert' && (
            <div className="p-6 bg-emerald-50/70 rounded-3xl border border-emerald-200 space-y-4 animate-scale-up">
              <h3 className="text-sm font-bold text-brand-900 font-display flex items-center gap-2">
                <FaGraduationCap className="text-brand-700" /> Agronomist Credentials & Advisory Terms
              </h3>
              <p className="text-[11px] text-surface-500 font-medium">Specify your agricultural qualifications and consultation rates.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputIcon icon={FaGraduationCap} name="qualification" placeholder="Degree (e.g. M.Sc. Agronomy, Ph.D.)" value={formData.qualification} onChange={handleChange} required />
                <InputIcon icon={FaSeedling} name="specialization" placeholder="Specialization (e.g. Soil & Plant Pathology)" value={formData.specialization} onChange={handleChange} required />
                <InputIcon icon={FaBriefcase} name="experienceYears" type="number" placeholder="Experience in Years (e.g. 7)" value={formData.experienceYears} onChange={handleChange} required />
                <InputIcon icon={FaRupeeSign} name="consultationFee" type="number" placeholder="Session Fee in ₹ (0 for Free)" value={formData.consultationFee} onChange={handleChange} required />
                <div className="md:col-span-2">
                  <InputIcon icon={FaClock} name="availableSlots" placeholder="Slots (e.g. 10:00 AM - 11:00 AM, 03:00 PM - 04:00 PM)" value={formData.availableSlots} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn-saas-primary text-xs !py-3.5 mt-4 shadow-sm disabled:opacity-50 font-bold">
            {loading ? 'Creating Verified Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-surface-500 font-medium">
          Already registered on Smart Krushi Bazar? <Link to="/login" className="text-brand-700 font-bold hover:underline">Sign In here</Link>
        </p>
      </div>
    </div>
  );
};

// Reusable Input Component with Icon
const InputIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-xs" />
    <input {...props} className="input-saas !pl-11 text-xs font-medium" />
  </div>
);

export default Register;
