const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Review = require('./src/models/Review');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

const seedSampleReviews = async () => {
  try {
    await connectDB();

    // Find any buyer
    let buyer = await User.findOne({ role: 'Buyer' });
    if (!buyer) {
      buyer = await User.create({
        name: 'Rahul Patel (Wholesale Aggregator)',
        email: 'rahul.buyer@example.com',
        password: 'password123',
        role: 'Buyer',
        phone: '+91 98250 11223',
        location: 'Surat, Gujarat'
      });
    }

    const products = await Product.find({ isActive: true }).limit(6);
    if (products.length === 0) {
      console.log('No products found to review');
      process.exit(0);
    }

    const sampleComments = [
      {
        rating: 5,
        title: 'Superb Orchard Freshness & Direct Delivery!',
        comment: 'Received direct dispatch from Navsari within 24 hours. The sweetness and natural aroma are unmatched compared to city wholesale markets. Zero damage or bruising during transit.'
      },
      {
        rating: 5,
        title: 'Crisp, high-grade produce at wholesale savings',
        comment: 'Very pleased with the quality and sorting. Sourced 50 kg for our local restaurant, and our customers loved the taste. Saved around 18% compared to local APMC mandi broker rates.'
      },
      {
        rating: 4,
        title: 'Fresh harvest and prompt communication from farmer',
        comment: 'Produce was fresh, naturally harvested, and well-packaged in ventilated crates. Farmer was very cooperative over chat. Will reorder regularly.'
      }
    ];

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const commentObj = sampleComments[i % sampleComments.length];

      const exists = await Review.findOne({ productId: prod._id, buyerId: buyer._id });
      if (!exists) {
        await Review.create({
          productId: prod._id,
          farmerId: prod.farmerId,
          buyerId: buyer._id,
          rating: commentObj.rating,
          title: commentObj.title,
          comment: commentObj.comment,
          isVerifiedBuyer: true
        });
        console.log(`Added sample review for ${prod.name}`);
      }
    }

    console.log('Sample reviews seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding reviews error:', err);
    process.exit(1);
  }
};

seedSampleReviews();
