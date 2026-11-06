const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create or update a review for a product
// @route   POST /api/reviews
// @access  Private (Buyer)
const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;
    const buyerId = req.user._id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating (1-5), and review comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if buyer has actually bought this product to verify purchase
    const hasOrdered = await Order.findOne({
      buyerId,
      productId,
      status: { $in: ['Completed', 'Accepted'] }
    });

    const isVerifiedBuyer = Boolean(hasOrdered);

    // Upsert review (update if already reviewed, else create)
    let review = await Review.findOne({ productId, buyerId });
    if (review) {
      review.rating = Number(rating);
      review.title = title || '';
      review.comment = comment;
      review.isVerifiedBuyer = isVerifiedBuyer;
      if (orderId) review.orderId = orderId;
      await review.save();
    } else {
      review = await Review.create({
        productId,
        farmerId: product.farmerId,
        buyerId,
        orderId: orderId || (hasOrdered ? hasOrdered._id : null),
        rating: Number(rating),
        title: title || '',
        comment,
        isVerifiedBuyer
      });
    }

    const populatedReview = await Review.findById(review._id).populate('buyerId', 'name profileImage location');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review: populatedReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
};

// @desc    Get all reviews for a product with statistics
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate('buyerId', 'name profileImage location')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let avgRating = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rate = Math.min(5, Math.max(1, Math.round(r.rating)));
        ratingDistribution[rate] = (ratingDistribution[rate] || 0) + 1;
        return acc + r.rating;
      }, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    res.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        avgRating,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

// @desc    Get reviews and aggregate rating for a farmer
// @route   GET /api/reviews/farmer/:farmerId
// @access  Public
const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const reviews = await Review.find({ farmerId })
      .populate('buyerId', 'name profileImage location')
      .populate('productId', 'name image price unit')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let avgRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    res.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        avgRating
      }
    });
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch farmer reviews', error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Author or Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review removed successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getFarmerReviews,
  deleteReview
};
