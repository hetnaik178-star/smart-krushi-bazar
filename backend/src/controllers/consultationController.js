const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Book a consultation (saved in Pending state until payment confirmation)
// @route   POST /api/consultations
// @access  Private (Farmer)
const bookConsultation = async (req, res) => {
  try {
    const {
      expertId,
      date,
      timeSlot,
      problemDescription,
      paymentMethod = 'Razorpay',
      paymentStatus,
      imageUrl: directImageUrl,
      razorpayOrderId = null,
      razorpayPaymentId = null,
      paymentId = null
    } = req.body;

    if (!expertId || !mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(400).json({ success: false, message: 'Valid Expert ID is required to book a consultation' });
    }

    const expert = await User.findOne({ _id: expertId, role: 'Expert' });
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Agricultural Expert not found' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please select an appointment date' });
    }

    if (!problemDescription || !problemDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe your crop problem or symptoms' });
    }

    let imageUrl = directImageUrl || null;
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'smart_krushi_bazar/consultations',
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

    const fee = (expert.consultationFee !== undefined && expert.consultationFee !== null) ? Number(expert.consultationFee) : 0;
    const finalPaymentStatus = paymentStatus || (fee === 0 ? 'Free' : (paymentMethod === 'COD' ? 'Pending' : 'Pending'));
    const finalStatus = finalPaymentStatus === 'Paid' ? 'Confirmed' : 'Pending';

    const consultation = await Consultation.create({
      farmerId: req.user._id,
      expertId: expert._id,
      date: new Date(date),
      timeSlot: timeSlot || '10:00 AM - 11:00 AM',
      problemDescription: problemDescription.trim(),
      imageUrl,
      fee,
      paymentMethod: fee === 0 ? 'Free' : paymentMethod,
      paymentStatus: finalPaymentStatus,
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      status: finalStatus
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('farmerId', 'name email phone location profileImage')
      .populate('expertId', 'name email phone specialization qualification profileImage consultationFee');

    res.status(201).json({ success: true, message: 'Consultation request booked', data: populated });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Book consultation error:', error);
    res.status(500).json({ success: false, message: 'Failed to book consultation', error: error.message });
  }
};

// @desc    Get consultations for logged in user (Farmer or Expert)
// @route   GET /api/consultations
// @access  Private
const getMyConsultations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Farmer') {
      query.farmerId = req.user._id;
    } else if (req.user.role === 'Expert') {
      query.expertId = req.user._id;
    }

    const consultations = await Consultation.find(query)
      .populate('farmerId', 'name email phone location profileImage')
      .populate('expertId', 'name email phone specialization qualification profileImage consultationFee')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch consultations', error: error.message });
  }
};

// @desc    Get single consultation by ID
// @route   GET /api/consultations/:id
// @access  Private
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmerId', 'name email phone location profileImage')
      .populate('expertId', 'name email phone specialization qualification profileImage consultationFee');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch consultation', error: error.message });
  }
};

// @desc    Update consultation status (Expert only)
// @route   PUT /api/consultations/:id/status
// @access  Private (Expert)
const updateConsultationStatus = async (req, res) => {
  try {
    const { status, expertNotes } = req.body;
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      expertId: req.user._id
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found or unauthorized' });
    }

    if (status) consultation.status = status;
    if (expertNotes !== undefined) consultation.expertNotes = expertNotes;

    await consultation.save();
    res.json({ success: true, message: 'Consultation updated', data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update consultation', error: error.message });
  }
};

module.exports = {
  bookConsultation,
  createConsultation: bookConsultation,
  getMyConsultations,
  getConsultationById,
  updateConsultationStatus
};
