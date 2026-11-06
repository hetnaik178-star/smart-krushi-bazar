const { getWeatherData, getLiveGpsWeather } = require('../utils/weatherService');

const getFarmerWeather = async (req, res) => {
  try {
    let { latitude, longitude } = req.user || {};
    // Default fallback coordinates if user profile coordinates are not set (e.g., Surat, Gujarat)
    if (!latitude || !longitude) {
      latitude = 21.1702;
      longitude = 72.8311;
    }
    const weather = await getWeatherData(latitude, longitude);
    if (!weather) return res.status(500).json({ message: 'Weather data temporarily unavailable.' });
    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching weather', error: error.message });
  }
};

// @desc    Get live GPS weather with reverse geocoded city name for header widget
// @route   GET /api/weather/live?lat=...&lon=...
// @access  Public
const getLiveWeather = async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lon = parseFloat(req.query.lon);

    // Fallback to Navsari, Gujarat coordinates if invalid
    if (isNaN(lat) || isNaN(lon)) {
      lat = 20.9467;
      lon = 72.9520;
    }

    const liveData = await getLiveGpsWeather(lat, lon);
    if (!liveData) {
      return res.status(500).json({ success: false, message: 'Live weather service temporarily unavailable' });
    }

    res.json({ success: true, data: liveData });
  } catch (error) {
    console.error('getLiveWeather controller error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching live weather', error: error.message });
  }
};

module.exports = { getFarmerWeather, getLiveWeather };
