import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProductReviews, deleteReview } from '../services/reviewService';
import ReviewModal from './ReviewModal';
import Avatar from './Avatar';
import { FaStar, FaRegStar, FaCheckCircle, FaPen, FaTrash, FaShieldAlt, FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReviewsSection({ product }) {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = async () => {
    if (!product?._id) return;
    try {
      setLoading(true);
      const res = await getProductReviews(product._id);
      if (res.success) {
        setReviews(res.reviews || []);
        setStats(res.stats || { totalReviews: 0, avgRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }
    } catch (err) {
      console.warn('Could not fetch product reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?._id]);

  const handleReviewSubmitted = (newReview) => {
    fetchReviews();
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;
    try {
      const res = await deleteReview(reviewId);
      if (res.success) {
        toast.success('Review removed');
        fetchReviews();
      }
    } catch (err) {
      toast.error('Failed to remove review');
    }
  };

  const renderStars = (score, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-xs';
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${sizeClass} ${star <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-surface-200'}`}
          />
        ))}
      </div>
    );
  };

  const total = stats.totalReviews || 0;

  return (
    <div className="mt-8 card-saas p-6 sm:p-8 shadow-premium border border-emerald-400/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
            <FaStar className="text-amber-500" /> Buyer Community Ratings
          </div>
          <h3 className="text-lg font-black text-surface-900 font-display">
            Customer Reviews & Harvest Quality
          </h3>
          <p className="text-xs text-surface-500 font-medium">
            Real feedback from verified buyers who procured this produce directly.
          </p>
        </div>

        {user?.role === 'Buyer' ? (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-luxe-primary text-xs !py-2.5 !px-4 flex items-center gap-2 shadow-sm shrink-0"
          >
            <FaPen className="text-xs" /> Write a Review
          </button>
        ) : !user ? (
          <span className="text-xs text-surface-500 italic">
            Login as a Buyer to share your review
          </span>
        ) : null}
      </div>

      {/* Rating Breakdown Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-surface-100 items-center">
        {/* Overall Score Box */}
        <div className="text-center md:border-r md:border-surface-100 md:pr-6">
          <div className="text-5xl font-black text-brand-900 font-display mb-1">
            {stats.avgRating > 0 ? stats.avgRating : '5.0'}
          </div>
          <div className="flex justify-center mb-1">
            {renderStars(stats.avgRating > 0 ? stats.avgRating : 5, 'md')}
          </div>
          <p className="text-xs text-surface-500 font-bold uppercase tracking-wider">
            Based on {total} {total === 1 ? 'buyer review' : 'buyer reviews'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <FaCheckCircle className="text-[10px]" /> 100% Verified Farm Orders
          </div>
        </div>

        {/* 5-Star Progress Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution?.[star] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : star === 5 ? 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-medium text-surface-600">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="font-bold text-surface-800">{star}</span>
                  <FaStar className="text-amber-400 text-[11px]" />
                </div>
                <div className="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] text-surface-500 font-bold">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="pt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-surface-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-surface-50/60 rounded-2xl border border-dashed border-surface-200">
            <FaComments className="text-3xl text-surface-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-surface-800 font-display">No reviews posted yet</p>
            <p className="text-xs text-surface-500 max-w-sm mx-auto mt-1">
              Be the first verified buyer to purchase this harvest and share feedback on produce quality and freshness!
            </p>
            {user?.role === 'Buyer' && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 btn-saas-secondary text-xs inline-flex items-center gap-1.5"
              >
                <FaPen className="text-[10px]" /> Add First Review
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const buyerName = rev.buyerId?.name || 'Verified Buyer';
              const buyerLoc = rev.buyerId?.location || 'India';
              const isOwn = user?._id && rev.buyerId?._id && user._id === rev.buyerId._id;

              return (
                <div
                  key={rev._id}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-surface-100 hover:border-emerald-200 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar src={rev.buyerId?.profileImage} name={buyerName} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-surface-900 font-display">{buyerName}</h4>
                          {rev.isVerifiedBuyer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <FaCheckCircle className="text-[9px]" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-surface-400 font-medium">
                          {buyerLoc} • {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderStars(rev.rating, 'sm')}
                      {(isOwn || user?.role === 'Admin') && (
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="text-surface-400 hover:text-red-500 p-1 text-xs transition-colors ml-2"
                          title="Delete review"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {rev.title && (
                    <h5 className="text-xs font-bold text-surface-900 mb-1 font-display">
                      "{rev.title}"
                    </h5>
                  )}
                  <p className="text-xs text-surface-600 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
