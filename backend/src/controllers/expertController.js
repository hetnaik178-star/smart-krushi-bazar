const User = require('../models/User');

// @desc    Get all experts
// @route   GET /api/experts
// @access  Public
const getExperts = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const query = { role: 'Expert' };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    const experts = await User.find(query).select('-password');
    res.json({ success: true, count: experts.length, data: experts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch experts', error: error.message });
  }
};

// @desc    Get single expert details
// @route   GET /api/experts/:id
// @access  Public
const getExpertById = async (req, res) => {
  try {
    const expert = await User.findOne({ _id: req.params.id, role: 'Expert' }).select('-password');
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Agricultural Expert not found' });
    }
    res.json({ success: true, data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expert profile', error: error.message });
  }
};

// @desc    Update expert profile details (availability, fees, qualification)
// @route   PUT /api/experts/profile
// @access  Private (Expert only)
const updateExpertProfile = async (req, res) => {
  try {
    const { qualification, specialization, experienceYears, consultationFee, availableDays, availableSlots, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'Expert') {
      return res.status(403).json({ success: false, message: 'Only experts can update expert profile' });
    }

    if (qualification !== undefined) user.qualification = qualification;
    if (specialization !== undefined) user.specialization = specialization;
    if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
    if (consultationFee !== undefined) user.consultationFee = Number(consultationFee);
    if (availableDays !== undefined) user.availableDays = availableDays;
    if (availableSlots !== undefined) user.availableSlots = availableSlots;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ success: true, message: 'Expert profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update expert profile', error: error.message });
  }
};

module.exports = { getExperts, getExpertById, updateExpertProfile };
