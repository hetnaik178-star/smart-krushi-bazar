import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ fallback = '/', label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there is a history entry in the browser session within the app
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-xs font-bold text-brand-800 hover:text-brand-950 bg-white/90 hover:bg-brand-50 border border-brand-200 px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:scale-95 ${className}`}
      aria-label={label}
    >
      <FaArrowLeft className="text-brand-600 group-hover:-translate-x-1 transition-transform duration-200 text-xs" />
      <span className="truncate max-w-[150px] sm:max-w-none">{label}</span>
    </button>
  );
};

export default BackButton;
