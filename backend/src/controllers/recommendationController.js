const { recommendCrops, CROP_DATABASE } = require('../utils/cropAdvisorModel');

/**
 * Get ML-based Crop Recommendations from soil & climate parameters
 * POST /api/recommendation/crop
 */
const getCropRecommendations = async (req, res) => {
  try {
    const { n, p, k, ph, soilType, season, waterAvailability, state } = req.body;

    const result = recommendCrops({
      n,
      p,
      k,
      ph,
      soilType,
      season,
      waterAvailability,
      state
    });

    res.status(200).json({
      success: true,
      message: 'Crop recommendations generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating crop recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop recommendations',
      error: error.message
    });
  }
};

/**
 * Get all supported crops catalogue
 * GET /api/recommendation/crops
 */
const getAllSupportedCrops = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      total: CROP_DATABASE.length,
      data: CROP_DATABASE
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops catalogue',
      error: error.message
    });
  }
};

module.exports = {
  getCropRecommendations,
  getAllSupportedCrops
};
