const { getWeatherData } = require('../utils/weatherService');

const getFarmerWeather = async (req, res) => {
  try {
    let { latitude, longitude } = req.user;
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

module.exports = { getFarmerWeather };
