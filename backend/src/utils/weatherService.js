const axios = require('axios');

// Rule-based advisory engine
const generateAdvisory = (current, daily) => {
  const advisories = [];
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const rainProb = (daily && daily.precipitation_probability_max) ? daily.precipitation_probability_max[0] : 0;

  if (rainProb > 50) advisories.push({ type: 'warning', msg: 'High rain probability expected. Consider postponing irrigation and harvesting.' });
  if (temp > 35) advisories.push({ type: 'danger', msg: 'Extreme heat detected. Monitor soil moisture and protect crops from heat stress.' });
  if (humidity > 80) advisories.push({ type: 'info', msg: 'High humidity levels. Monitor crops for fungal diseases.' });
  if (wind > 20) advisories.push({ type: 'warning', msg: 'Strong winds expected. Avoid spraying pesticides or fertilizers today.' });
  
  if (advisories.length === 0) advisories.push({ type: 'success', msg: 'Weather conditions are favorable for standard farming activities.' });
  return advisories;
};

const getWeatherData = async (lat, lon) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const response = await axios.get(url);
    const data = response.data;
    
    return {
      current: data.current,
      daily: data.daily,
      advisories: generateAdvisory(data.current, data.daily)
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return null;
  }
};

module.exports = { getWeatherData };
