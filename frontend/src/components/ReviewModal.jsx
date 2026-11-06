import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { submitReview } from '../services/reviewService';
import { FaStar, FaTimes, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose, product, orderId, onReviewSubmitted }) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const ratingDescriptions = {
    1: '1 Star - Unsatisfactory Quality',
    2: '2 Stars - Average / Below Expectation',
    3: '3 Stars - Good & Acceptable',
    4: '4 Stars - Very Fresh & High Quality',
    5: '5 Stars - Outstanding Farm Fresh Produce! 🌟'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login as a Buyer to submit a review');
      return;
    }
    if (user.role !== 'Buyer') {
      toast.error('Only registered buyers can post produce reviews');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a brief comment sharing your experience');
      return;
    }

    try {
      setLoading(true);
      const res = await submitReview({
        productId: product._id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        orderId: orderId || null
      });

      if (res.success) {
        toast.success(res.message || 'Review posted successfully! ⭐', { icon: '🌾' });
        if (onReviewSubmitted) {
          onReviewSubmitted(res.review);
        }
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-sm animate-fade-in">
      <div className="card-luxe w-full max-w-lg overflow-hidden bg-white shadow-2xl border border-emerald-300/30 animate-scale-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-brand-900 text-white">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <FaShieldAlt className="text-emerald-300" /> Verified Buyer Review
            </div>
            <h3 className="text-base font-bold font-display">Rate & Review Produce</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Summary Mini Card */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-xl border border-emerald-300 shadow-sm shrink-0"
              />
            )}
            <div>
              <h4 className="font-bold text-surface-900 text-sm font-display line-clamp-1">{product.name}</h4>
              <p className="text-xs text-surface-600 font-medium">₹{product.price} / {product.unit || 'kg'} • {product.location || 'Direct Farm'}</p>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-2">
              Select Your Rating:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} Star`}
                  >
                    <FaStar className={active ? 'text-amber-400 drop-shadow-sm' : 'text-surface-200'} />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-black text-brand-900 font-display">
                {rating} / 5
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-700 mt-1">
              {ratingDescriptions[hoverRating || rating]}
            </p>
          </div>

          {/* Review Headline (Optional) */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Review Headline (Short):
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Crisp, sweet and organically grown!"
              maxLength={80}
              className="input-saas w-full text-xs font-medium"
            />
          </div>

          {/* Detailed Experience Comment */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Detailed Experience & Freshness: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              placeholder="Tell other buyers about produce freshness, packaging, aroma, sweetness/taste, and farm gate dispatch..."
              maxLength={1000}
              className="input-saas w-full text-xs leading-relaxed"
            />
            <p className="text-[10px] text-surface-400 text-right mt-1">
              {comment.length} / 1000 characters
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-saas-secondary text-xs px-4 py-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-saas-primary text-xs px-5 py-2 flex items-center gap-2 shadow-sm"
            >
              {loading ? 'Submitting...' : 'Post Verified Review ⭐'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
