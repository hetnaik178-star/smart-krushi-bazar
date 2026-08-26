const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Farmer Analytics
const getFarmerAnalytics = async (req, res) => {
  try {
    const farmerId = req.user._id;
    
    const totalSales = await Order.aggregate([
      { $match: { farmerId, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { farmerId, status: 'Completed' } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          sales: { $sum: "$totalPrice" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const bestSelling = await Order.aggregate([
      { $match: { farmerId, status: 'Completed' } },
      { $group: { _id: "$productName", totalQty: { $sum: "$quantity" } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders: totalSales[0]?.count || 0,
      monthlySales,
      bestSelling
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch farmer analytics', error: error.message });
  }
};

// Admin Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'Farmer' });
    const totalBuyers = await User.countDocuments({ role: 'Buyer' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const orderStats = await Order.aggregate([
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalSales: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      totalUsers, totalFarmers, totalBuyers, totalProducts,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalSales: orderStats[0]?.totalSales || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin analytics', error: error.message });
  }
};

module.exports = { getFarmerAnalytics, getAdminAnalytics };
