import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('smart_krushi_lang') || 'en';
  });

  const setLanguage = (lang) => {
    if (['en', 'hi', 'gu'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('smart_krushi_lang', lang);
    }
  };

  // Helper translation resolver with interpolation support: t('key', 'fallback', { name: '...' }) or t('key', { name: '...' })
  const t = (keyPath, fallbackOrParams = '', maybeParams = {}) => {
    if (!keyPath) return '';

    let fallback = '';
    let params = {};

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
      fallback = '';
    } else {
      fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : '';
      if (typeof maybeParams === 'object' && maybeParams !== null) {
        params = maybeParams;
      }
    }

    const parts = keyPath.split('.');
    let current = translations[language];

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    let result = '';

    // If translation found in current language
    if (current !== undefined && typeof current === 'string') {
      result = current;
    } else {
      // Fallback to English dictionary
      let enCurrent = translations['en'];
      for (const part of parts) {
        if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
          enCurrent = enCurrent[part];
        } else {
          enCurrent = undefined;
          break;
        }
      }

      if (enCurrent !== undefined && typeof enCurrent === 'string') {
        result = enCurrent;
      } else {
        result = fallback || parts[parts.length - 1];
      }
    }

    // Dynamic parameter interpolation: e.g. {{name}} or {name}
    if (typeof result === 'string' && Object.keys(params).length > 0) {
      for (const [key, val] of Object.entries(params)) {
        const replacement = val !== undefined && val !== null ? String(val) : '';
        result = result.split(`{{${key}}}`).join(replacement);
        result = result.split(`{${key}}`).join(replacement);
      }
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (k, fb) => fb || k
    };
  }
  return context;
};

export default LanguageContext;
