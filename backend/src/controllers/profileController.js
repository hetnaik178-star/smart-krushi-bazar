const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, farmName, specialization } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio !== undefined) user.bio = bio;
    
    if (user.role === 'Farmer') {
      if (farmName !== undefined) user.farmName = farmName;
      if (specialization !== undefined) user.specialization = specialization;
    }
    
    const updatedUser = await user.save();
    
    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Upload/update profile photo
// @route   PUT /api/profile/photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
    
    let photoUrl = '';
    
    // Upload to Cloudinary if configured, otherwise use static upload path
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'smart_krushi_bazar/profiles',
        resource_type: 'auto',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      photoUrl = result.secure_url;
    } else {
      photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    
    user.profileImage = photoUrl;
    await user.save();
    
    res.json({ success: true, message: 'Profile photo updated', data: { profileImage: photoUrl } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Failed to upload profile photo' });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/profile/photo
// @access  Private
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
    
    user.profileImage = null;
    await user.save();
    
    res.json({ success: true, message: 'Profile photo removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove profile photo' });
  }
};

// @desc    Get public farmer profile
// @route   GET /api/farmers/:id
// @access  Public
const getPublicFarmerProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select('name location profileImage bio farmName specialization role createdAt');
    
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    if (farmer.role !== 'Farmer') return res.status(400).json({ success: false, message: 'User is not a farmer' });
    
    const activeProducts = await Product.countDocuments({ farmerId: farmer._id, quantity: { $gt: 0 } });
    
    const products = await Product.find({ farmerId: farmer._id })
      .sort({ createdAt: -1 })
      .limit(12);
    
    res.json({
      success: true,
      data: {
        ...farmer.toObject(),
        activeProducts,
        products
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch farmer profile' });
  }
};

// @desc    Get profile stats for dashboard
// @route   GET /api/profile/stats
// @access  Private
const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    let stats = {};
    
    if (role === 'Farmer') {
      const activeProducts = await Product.countDocuments({ farmerId: userId, quantity: { $gt: 0 } });
      const totalOrders = await Order.countDocuments({ farmerId: userId });
      const pendingOrders = await Order.countDocuments({ farmerId: userId, status: 'Pending' });
      const completedOrders = await Order.countDocuments({ farmerId: userId, status: 'Completed' });
      
      stats = { activeProducts, totalOrders, pendingOrders, completedOrders };
    } else if (role === 'Buyer') {
      const totalOrders = await Order.countDocuments({ buyerId: userId });
      const pendingOrders = await Order.countDocuments({ buyerId: userId, status: 'Pending' });
      const completedOrders = await Order.countDocuments({ buyerId: userId, status: 'Completed' });
      
      const wishlist = await Wishlist.findOne({ buyerId: userId });
      const wishlistCount = wishlist ? wishlist.products.length : 0;
      
      stats = { totalOrders, pendingOrders, completedOrders, wishlistCount };
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile stats' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  getPublicFarmerProfile,
  getProfileStats
};
