const Demand = require('../models/Demand');

// @desc    Create new wholesale crop procurement demand
// @route   POST /api/demands
// @access  Private (Buyer)
const createDemand = async (req, res) => {
  try {
    const { cropName, category, quantity, unit, targetPrice, deliveryLocation, requiredByDate, qualityNotes } = req.body;

    if (!cropName || !quantity || !targetPrice || !deliveryLocation || !requiredByDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const demand = await Demand.create({
      buyerId: req.user._id,
      buyerName: req.user.name,
      buyerPhone: req.user.phone || '',
      cropName,
      category: category || 'Vegetables',
      quantity,
      unit: unit || 'kg',
      targetPrice,
      deliveryLocation,
      requiredByDate: new Date(requiredByDate),
      qualityNotes: qualityNotes || '',
      status: 'Active'
    });

    res.status(201).json({ success: true, message: 'Procurement demand posted successfully', demand });
  } catch (error) {
    console.error('createDemand error:', error);
    res.status(500).json({ success: false, message: 'Failed to post demand', error: error.message });
  }
};

// @desc    Get all demands posted by logged-in buyer
// @route   GET /api/demands/my
// @access  Private (Buyer)
const getMyDemands = async (req, res) => {
  try {
    let demands = await Demand.find({ buyerId: req.user._id }).sort({ createdAt: -1 });

    // Seed demo demands if buyer has no demands yet (so presentation looks rich immediately)
    if (!demands || demands.length === 0) {
      const demoDemands = [
        {
          buyerId: req.user._id,
          buyerName: req.user.name,
          buyerPhone: req.user.phone || '9823456789',
          cropName: 'Fresh Hybrid Tomatoes',
          category: 'Vegetables',
          quantity: 200,
          unit: 'kg',
          targetPrice: 26,
          deliveryLocation: req.user.location || 'Bardoli, Gujarat',
          requiredByDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          qualityNotes: 'Firm red grade A, suitable for retail supermarket packing. Low transit damage.',
          status: 'Active',
          responsesCount: 2
        },
        {
          buyerId: req.user._id,
          buyerName: req.user.name,
          buyerPhone: req.user.phone || '9823456789',
          cropName: 'Valsadi Alphonso Mangoes',
          category: 'Fruits',
          quantity: 25,
          unit: 'Crates',
          targetPrice: 110,
          deliveryLocation: req.user.location || 'Bardoli, Gujarat',
          requiredByDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          qualityNotes: 'Tree-ripened without chemical calcium carbide. Export quality grade.',
          status: 'In Negotiation',
          responsesCount: 3
        }
      ];
      demands = await Demand.insertMany(demoDemands);
    }

    res.json({ success: true, demands });
  } catch (error) {
    console.error('getMyDemands error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch demands', error: error.message });
  }
};

// @desc    Get all active demands for farmers and suppliers
// @route   GET /api/demands/active
// @access  Public / Private
const getActiveDemands = async (req, res) => {
  try {
    const demands = await Demand.find({ status: { $in: ['Active', 'In Negotiation'] } })
      .populate('buyerId', 'name location email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, demands });
  } catch (error) {
    console.error('getActiveDemands error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active demands', error: error.message });
  }
};

// @desc    Update demand status (Active, Fulfilled, Closed)
// @route   PATCH /api/demands/:id/status
// @access  Private (Buyer/Admin)
const updateDemandStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const demand = await Demand.findById(req.params.id);

    if (!demand) {
      return res.status(404).json({ success: false, message: 'Demand not found' });
    }

    if (demand.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this demand' });
    }

    demand.status = status || demand.status;
    await demand.save();

    res.json({ success: true, message: 'Demand status updated successfully', demand });
  } catch (error) {
    console.error('updateDemandStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update demand status', error: error.message });
  }
};

// @desc    Delete a demand
// @route   DELETE /api/demands/:id
// @access  Private (Buyer/Admin)
const deleteDemand = async (req, res) => {
  try {
    const demand = await Demand.findById(req.params.id);

    if (!demand) {
      return res.status(404).json({ success: false, message: 'Demand not found' });
    }

    if (demand.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this demand' });
    }

    await demand.deleteOne();
    res.json({ success: true, message: 'Demand removed successfully' });
  } catch (error) {
    console.error('deleteDemand error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete demand', error: error.message });
  }
};

module.exports = {
  createDemand,
  getMyDemands,
  getActiveDemands,
  updateDemandStatus,
  deleteDemand
};
