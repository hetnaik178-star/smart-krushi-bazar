import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';
import { FaSeedling, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      login(data, data.token);
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'Farmer') {
        navigate('/farmer/dashboard');
      } else if (data.role === 'Expert') {
        navigate('/expert/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 page-fade-in">
      <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-premium border border-surface-200">
        
        {/* Brand Icon Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-800 to-emerald-600 text-white rounded-2xl shadow-md shadow-brand-900/20 mb-3 animate-float">
            <FaSeedling size={26} className="text-emerald-100" />
          </div>
          <h1 className="page-heading text-2xl font-display">Welcome Back</h1>
          <p className="text-xs text-surface-500 font-medium mt-1">Sign in to your Smart Krushi Bazar portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 text-surface-400 text-xs" />
              <input
                type="email"
                placeholder="name@krushibazar.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-saas !pl-10 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 font-display">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 text-surface-400 text-xs" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-saas !pl-10 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-saas-primary text-xs !py-3.5 mt-3 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-surface-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:text-brand-900 hover:underline">
            Register as Farmer or Buyer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
