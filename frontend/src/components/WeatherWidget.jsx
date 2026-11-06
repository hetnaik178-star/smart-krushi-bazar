import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';
import { FaMapMarkerAlt, FaCloudSun, FaTint, FaWind } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const WeatherWidget = ({ compact = false }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'denied' | 'error'

  useEffect(() => {
    // Check session cache first (10 min ttl)
    const cached = sessionStorage.getItem('smart_krushi_weather_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          setWeather(parsed.data);
          setStatus('ready');
          return;
        }
      } catch (e) {
        // Cache corrupted, continue
      }
    }

    if (!('geolocation' in navigator)) {
      fetchWeatherFallback(20.9467, 72.9520); // Navsari fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchLiveWeather(latitude, longitude);
      },
      (err) => {
        // Location denied or unavailable — use clean fallback
        setStatus('denied');
        fetchWeatherFallback(20.9467, 72.9520);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);




  const fetchLiveWeather = async (lat, lon) => {
    try {
      const res = await axios.get(`${API_URL}/weather/live?lat=${lat}&lon=${lon}`, { timeout: 7000 });
      if (res.data?.success && res.data.data) {
        setWeather(res.data.data);
        setStatus('ready');
        sessionStorage.setItem('smart_krushi_weather_cache', JSON.stringify({
          timestamp: Date.now(),
          data: res.data.data
        }));
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const fetchWeatherFallback = async (lat, lon) => {
    try {
      const res = await axios.get(`${API_URL}/weather/live?lat=${lat}&lon=${lon}`, { timeout: 7000 });
      if (res.data?.success && res.data.data) {
        setWeather(res.data.data);
      }
    } catch (e) {
      // Graceful silence
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-400/20 text-[10px] text-emerald-200 animate-pulse">
        <FaMapMarkerAlt className="text-[9px] text-emerald-400" />
        <span>{t('nav.detectingWeather', 'Detecting live weather...')}</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-800/40 text-[10px] text-surface-300">
        <FaMapMarkerAlt className="text-[9px] text-amber-400" />
        <span>{t('nav.locationUnavailable', 'Location unavailable')}</span>
      </div>
    );
  }

  // Compact Mobile Mode
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-400/20">
        <FaMapMarkerAlt className="text-emerald-400 text-[10px]" />
        <span className="truncate max-w-[80px] text-white">{weather.location}</span>
        <span>{weather.temperature}°C</span>
        <span>{weather.icon}</span>
      </div>
    );
  }

  // Full Desktop Mode
  return (
    <div 
      className="hidden lg:flex items-center gap-2 bg-emerald-900/70 hover:bg-emerald-900/90 px-3 py-0.5 rounded-full border border-emerald-400/25 transition-all text-[11px] text-emerald-100 shadow-sm cursor-default"
      title={`${weather.location}, ${weather.state} | ${weather.condition} | Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h`}
    >
      <div className="flex items-center gap-1 text-emerald-300 font-bold">
        <FaMapMarkerAlt className="text-[10px] text-emerald-400 animate-bounce" />
        <span className="text-white">{weather.location}</span>
      </div>
      <span className="text-emerald-400/40">|</span>
      <div className="flex items-center gap-1.5 font-bold text-amber-300">
        <span>{weather.temperature}°C</span>
        <span className="text-xs">{weather.icon}</span>
        <span className="text-emerald-200/90 font-medium text-[10px] hidden xl:inline">
          {weather.condition}
        </span>
      </div>
      <span className="text-emerald-400/40 hidden xl:inline">|</span>
      <div className="hidden xl:flex items-center gap-2 text-[10px] text-emerald-300/80 font-medium">
        <span className="flex items-center gap-0.5" title="Relative Humidity">
          <FaTint className="text-[9px] text-cyan-400" /> {weather.humidity}%
        </span>
      </div>
    </div>
  );
};

export default WeatherWidget;
