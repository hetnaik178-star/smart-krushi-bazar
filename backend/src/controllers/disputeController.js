const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Raise a dispute for an order
// @route   POST /api/disputes
// @access  Private (Buyer)
const createDispute = async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to raise dispute for this order' });
    }

    let imageUrl = null;
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'smart_krushi_bazar/disputes',
            resource_type: 'auto'
          });
          imageUrl = result.secure_url;
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (cErr) {
          imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
      } else {
        imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    const dispute = await Dispute.create({
      orderId,
      raisedBy: req.user._id,
      reason,
      description,
      imageUrl
    });

    const populated = await Dispute.findById(dispute._id)
      .populate('orderId')
      .populate('raisedBy', 'name email phone');

    res.status(201).json({ success: true, message: 'Dispute submitted successfully', data: populated });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Failed to raise dispute', error: error.message });
  }
};

// @desc    Get current user's disputes
// @route   GET /api/disputes/my
// @access  Private
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user._id })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'productId', select: 'name image price' },
          { path: 'farmerId', select: 'name email phone' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch disputes', error: error.message });
  }
};

// @desc    Get all disputes (Admin)
// @route   GET /api/disputes
// @access  Private (Admin)
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate({
        path: 'orderId',
        populate: [
          { path: 'productId', select: 'name image price' },
          { path: 'farmerId', select: 'name email phone' },
          { path: 'buyerId', select: 'name email phone' }
        ]
      })
      .populate('raisedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all disputes', error: error.message });
  }
};

// @desc    Update/Resolve dispute status (Admin)
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin)
const resolveDispute = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    if (status) dispute.status = status;
    if (adminNotes !== undefined) dispute.adminNotes = adminNotes;

    await dispute.save();

    res.json({ success: true, message: 'Dispute resolution updated', data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve dispute', error: error.message });
  }
};

module.exports = { createDispute, getMyDisputes, getAllDisputes, resolveDispute };
