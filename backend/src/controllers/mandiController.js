const { fetchMandiData, getAvailableLocations, getMandiPriceTrend } = require('../services/mandiDataService');

// @desc    Get real daily APMC Mandi commodity market prices
// @route   GET /api/mandi
// @access  Public
const getMandiPrices = async (req, res) => {
  try {
    const result = await fetchMandiData(req.query);
    res.json({
      success: true,
      count: result.count,
      data: result.data,
      summary: result.summary,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error fetching Mandi prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Mandi prices',
      error: error.message
    });
  }
};

// @desc    Get dynamic hierarchy of available states, districts, markets and commodities for cascading filter menus
// @route   GET /api/mandi/locations
// @access  Public
const getMandiLocations = async (req, res) => {
  try {
    const locations = await getAvailableLocations();
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching Mandi locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Mandi filter locations',
      error: error.message
    });
  }
};

// @desc    Get 7-day or 30-day commodity price trend history
// @route   GET /api/mandi/trend
// @access  Public
const getMandiTrend = async (req, res) => {
  try {
    const { commodity = 'Wheat', days = 7, market } = req.query;
    const trend = await getMandiPriceTrend(commodity, days, market);
    res.json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('Error fetching Mandi price trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Mandi price trend',
      error: error.message
    });
  }
};

module.exports = {
  getMandiPrices,
  getMandiLocations,
  getMandiTrend
};
