const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      latitude,
      longitude,
      qualification,
      specialization,
      experienceYears,
      consultationFee,
      availableSlots,
      availableDays,
      farmName
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = {
      name,
      email,
      password,
      role: role || 'Buyer',
      phone,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      farmName: farmName || '',
      specialization: specialization || ''
    };

    // Add Expert specific fields if role is Expert
    if (role === 'Expert') {
      userData.qualification = qualification || '';
      userData.specialization = specialization || '';
      userData.experienceYears = experienceYears ? Number(experienceYears) : 0;
      userData.consultationFee = consultationFee !== undefined ? Number(consultationFee) : 0;
      userData.availableSlots = Array.isArray(availableSlots)
        ? availableSlots
        : typeof availableSlots === 'string'
        ? availableSlots.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      userData.availableDays = Array.isArray(availableDays) ? availableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      userData.isExpertVerified = true;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      profileImage: user.profileImage,
      bio: user.bio,
      farmName: user.farmName,
      specialization: user.specialization,
      qualification: user.qualification,
      experienceYears: user.experienceYears,
      consultationFee: user.consultationFee,
      availableSlots: user.availableSlots,
      availableDays: user.availableDays,
      isExpertVerified: user.isExpertVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        latitude: user.latitude,
        longitude: user.longitude,
        profileImage: user.profileImage,
        bio: user.bio,
        farmName: user.farmName,
        specialization: user.specialization,
        qualification: user.qualification,
        experienceYears: user.experienceYears,
        consultationFee: user.consultationFee,
        availableSlots: user.availableSlots,
        availableDays: user.availableDays,
        isExpertVerified: user.isExpertVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
