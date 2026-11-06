const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const escapeCSV = (field) => {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('farmerId', 'name').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const deleteAnyProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const deleteAnyUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// @desc    Export platform users as clean CSV
// @route   GET /api/admin/export/users
// @access  Private (Admin only)
const exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Phone', 'Location', 'Is Verified', 'Registration Date'];
    const rows = users.map(u => [
      escapeCSV(u._id),
      escapeCSV(u.name),
      escapeCSV(u.email),
      escapeCSV(u.role),
      escapeCSV(u.phone || 'N/A'),
      escapeCSV(u.location || 'India'),
      escapeCSV(u.isVerified ? 'Yes' : 'No'),
      escapeCSV(new Date(u.createdAt).toISOString())
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smart_krushi_users_${dateStr}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportUsersCSV error:', error);
    res.status(500).json({ message: 'Failed to export users CSV', error: error.message });
  }
};

// @desc    Export platform sales/orders report as clean CSV
// @route   GET /api/admin/export/orders
// @access  Private (Admin only)
const exportSalesCSV = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 });

    const headers = [
      'Order ID',
      'Order Date',
      'Product Name',
      'Quantity',
      'Unit Price (INR)',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Status',
      'Buyer Name',
      'Buyer Email',
      'Farmer Name',
      'Farmer Email'
    ];

    const rows = orders.map(o => [
      escapeCSV(o._id),
      escapeCSV(new Date(o.createdAt).toISOString()),
      escapeCSV(o.productName),
      escapeCSV(o.quantity),
      escapeCSV(o.unitPrice),
      escapeCSV(o.totalPrice),
      escapeCSV(o.paymentMethod),
      escapeCSV(o.paymentStatus),
      escapeCSV(o.status),
      escapeCSV(o.trackingStatus || 'ORDER_PLACED'),
      escapeCSV(o.buyerId?.name || 'N/A'),
      escapeCSV(o.buyerId?.email || 'N/A'),
      escapeCSV(o.farmerId?.name || 'N/A'),
      escapeCSV(o.farmerId?.email || 'N/A')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smart_krushi_sales_report_${dateStr}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportSalesCSV error:', error);
    res.status(500).json({ message: 'Failed to export sales report CSV', error: error.message });
  }
};

// @desc    Seed/Reset demo data for viva & testing
// @route   POST /api/admin/seed-demo
// @access  Private (Admin only)
const seedDemo = async (req, res) => {
  try {
    const { seedDemoData } = require('../utils/demoSeeder');
    const result = await seedDemoData();
    res.json({
      success: true,
      message: 'Platform demo data seeded successfully with verified accounts, products, and orders.',
      data: result
    });
  } catch (error) {
    console.error('seedDemo error:', error);
    res.status(500).json({ message: 'Failed to seed demo data', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllProducts,
  getAllOrders,
  deleteAnyProduct,
  deleteAnyUser,
  exportUsersCSV,
  exportSalesCSV,
  seedDemo
};
