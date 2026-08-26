import { useEffect, useState } from 'react';
import { getWeather } from '../services/weatherService';
import { WiDaySunny, WiRain, WiCloudy, WiStrongWind, WiHumidity } from 'react-icons/wi';
import { FaLeaf } from 'react-icons/fa';

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeather()
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card-saas p-6 h-48 skeleton-shimmer"></div>;
  }

  if (!weather) {
    return (
      <div className="card-saas p-4 text-surface-500 text-xs font-medium">
        Weather advisory feed temporarily offline.
      </div>
    );
  }

  const { current, advisories } = weather;

  return (
    <div className="card-saas p-6 relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 border-emerald-200/80 shadow-premium">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <FaLeaf className="text-brand-600 text-[9px]" /> Live Agro-Meteo
          </span>
          <h3 className="text-4xl font-black text-surface-900 font-display mt-2">{current.temperature_2m}°C</h3>
          <p className="text-xs text-surface-600 mt-1 font-medium flex items-center gap-3">
            <span>💧 Humidity: {current.relative_humidity_2m}%</span>
            <span>💨 Wind: {current.wind_speed_10m} km/h</span>
          </p>
        </div>
        <div>
          {current.temperature_2m > 30 ? (
            <WiDaySunny className="text-6xl text-amber-500 animate-pulse-slow" />
          ) : current.precipitation > 0 ? (
            <WiRain className="text-6xl text-blue-500" />
          ) : (
            <WiCloudy className="text-6xl text-slate-400" />
          )}
        </div>
      </div>
      
      <div className="mt-5 border-t border-surface-200/80 pt-4">
        <h4 className="font-bold text-brand-900 text-xs uppercase tracking-wider mb-2.5 font-display flex items-center gap-1.5">
          🌾 Smart Farm Advisory
        </h4>
        <ul className="space-y-2">
          {advisories.map((adv, i) => (
            <li
              key={i}
              className={`text-xs p-3 rounded-xl font-medium border leading-relaxed ${
                adv.type === 'danger'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : adv.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : adv.type === 'info'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-emerald-50 text-brand-900 border-emerald-200'
              }`}
            >
              {adv.msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherCard;
