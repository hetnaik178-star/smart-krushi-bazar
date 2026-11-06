import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SCHEMES_DATABASE } from '../data/schemesData';
import { FaLandmark, FaCheckCircle, FaFileAlt, FaExternalLinkAlt, FaFilter, FaSearch, FaUserCheck, FaTimes } from 'react-icons/fa';
import WhatsAppShareButton from '../components/WhatsAppShareButton';

export default function GovtSchemes() {
  const { language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Eligibility Checker Modal State
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);
  const [eligibilityAnswers, setEligibilityAnswers] = useState({
    landCategory: 'Small', // 'Small' (< 2 Ha), 'Medium' (2-5 Ha), 'Large' (> 5 Ha)
    benefitType: 'cash',   // 'cash', 'insurance', 'solar_pump', 'equipment'
    state: 'Gujarat'
  });
  const [checkerMatched, setCheckerMatched] = useState(null);

  const categories = [
    { id: 'All', labelEn: 'All Schemes', labelHi: 'सभी योजनाएं', labelGu: 'તમામ યોજનાઓ' },
    { id: 'Financial Assistance', labelEn: 'Cash / DBT', labelHi: 'वित्तीय सहायता', labelGu: 'નાણાકીય સહાય' },
    { id: 'Crop Insurance', labelEn: 'Crop Insurance', labelHi: 'फसल बीमा', labelGu: 'પાક વીમો' },
    { id: 'Solar & Irrigation', labelEn: 'Solar & Irrigation', labelHi: 'सौर एवं सिंचाई', labelGu: 'સોલાર અને સિંચાઈ' },
    { id: 'Farm Machinery', labelEn: 'Machinery & Tools', labelHi: 'कृषि उपकरण', labelGu: 'કૃષિ ઓજાર' },
    { id: 'Soil & Testing', labelEn: 'Soil Health', labelHi: 'मृदा स्वास्थ्य', labelGu: 'જમીન ચકાસણી' }
  ];

  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATABASE.filter(scheme => {
      // Category filter
      if (selectedCategory !== 'All' && scheme.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel === 'Central' && !scheme.level.includes('Central')) {
        return false;
      }
      if (selectedLevel === 'Gujarat' && !scheme.level.includes('Gujarat')) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = scheme.name.toLowerCase().includes(q);
        const matchHi = scheme.hindiName?.toLowerCase().includes(q);
        const matchGu = scheme.gujaratiName?.toLowerCase().includes(q);
        const matchBenefit = scheme.benefit.toLowerCase().includes(q);
        if (!matchName && !matchHi && !matchGu && !matchBenefit) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  const handleRunEligibilityChecker = () => {
    const matched = SCHEMES_DATABASE.filter(scheme => {
      const criteria = scheme.eligibilityCriteria;
      if (!criteria) return true;
      const typeMatch = criteria.types.includes(eligibilityAnswers.landCategory);
      const benefitMatch = criteria.benefitsWanted.includes(eligibilityAnswers.benefitType);
      return typeMatch && benefitMatch;
    });
    setCheckerMatched(matched);
  };

  const getSchemeName = (s) => {
    if (language === 'gu' && s.gujaratiName) return s.gujaratiName;
    if (language === 'hi' && s.hindiName) return s.hindiName;
    return s.name;
  };

  const getSchemeBenefit = (s) => {
    if (language === 'gu' && s.benefitGu) return s.benefitGu;
    if (language === 'hi' && s.benefitHi) return s.benefitHi;
    return s.benefit;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header Banner Box */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 rounded-3xl p-7 sm:p-9 text-white shadow-premium mb-8 relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold text-harvest-300 border border-white/20 mb-3">
              <FaLandmark className="text-harvest-400" />
              <span>Central & Gujarat State Agriculture Portals</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white mb-3">
              {language === 'gu'
                ? 'સરકારી કૃષિ યોજનાઓ અને સહાય પોર્ટલ'
                : language === 'hi'
                ? 'सरकारी कृषि योजनाएं एवं सहायता पोर्टल'
                : 'Government Schemes & Kisan Yojana Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-medium">
              {language === 'gu'
                ? 'પીએમ-કિસાન, આઈ-ખેડૂત, સોલાર પંપ સબસિડી અને પાક વીમા યોજનાઓની સત્તાવાર માહિતી અને સીધી અરજી લિંક્સ.'
                : language === 'hi'
                ? 'पीएम-किसान, आई-खेड़ूत, सौर पंप सब्सिडी और फसल बीमा योजनाओं की आधिकारिक जानकारी और सीधी आवेदन लिंक्स।'
                : 'Verified access to Central & Gujarat state agricultural subsidies, DBT grants, solar irrigation schemes, and official portals.'}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setIsCheckerOpen(true);
                setCheckerMatched(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/30"
            >
              <FaUserCheck className="text-lg" />
              <span>
                {language === 'gu'
                  ? '🎯 તમારી યોગ્યતા ચકાસો (૩ પ્રશ્નો)'
                  : language === 'hi'
                  ? '🎯 अपनी पात्रता जांचें (3 सवाल)'
                  : '🎯 Check Scheme Eligibility'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-surface-200 shadow-md mb-8 space-y-4">
        {/* Search and Level Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-4 top-3.5 text-surface-400 text-sm" />
            <input
              type="text"
              placeholder={
                language === 'gu'
                  ? 'યોજનાનું નામ અથવા લાભ શોધો (દા.ત. પીએમ કિસાન, ટ્રેક્ટર, સોલાર)...'
                  : language === 'hi'
                  ? 'योजना का नाम या लाभ खोजें (उदा. पीएम किसान, ट्रैक्टर, सोलर)...'
                  : 'Search schemes by name or benefit (e.g. PM Kisan, Solar, Drip)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-surface-300 text-surface-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-surface-600 flex items-center gap-1">
              <FaFilter />
              <span>Level:</span>
            </span>
            {['All', 'Central', 'Gujarat'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedLevel === lvl
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-emerald-400 shadow-sm'
                }`}
              >
                {lvl === 'All' ? 'All Portals' : lvl === 'Central' ? '🇮🇳 Central Govt' : '🦁 Gujarat i-Khedut'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-sm'
                  : 'bg-white text-surface-700 border border-surface-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              {language === 'gu' ? cat.labelGu : language === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="flex flex-col justify-between rounded-3xl bg-white/95 backdrop-blur-md p-6 border border-surface-200 shadow-md hover:shadow-xl transition-all group"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {scheme.level}
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {scheme.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-surface-900 group-hover:text-emerald-700 transition-colors">
                {getSchemeName(scheme)}
              </h3>

              {/* Benefit Box */}
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 font-medium">
                <strong className="block text-emerald-800 font-bold mb-1">
                  🎁 {language === 'gu' ? 'મુખ્ય લાભ / સહાય:' : language === 'hi' ? 'मुख्य लाभ:' : 'Key Benefit:'}
                </strong>
                {getSchemeBenefit(scheme)}
              </div>

              {/* Required Documents */}
              <div className="mt-4">
                <div className="text-xs font-bold text-surface-700 flex items-center gap-1.5 mb-2">
                  <FaFileAlt className="text-emerald-600" />
                  <span>{language === 'gu' ? 'જરૂરી દસ્તાવેજો:' : language === 'hi' ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documents.map((doc, dIdx) => (
                    <span
                      key={dIdx}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-200/80 text-surface-700 font-medium"
                    >
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>{language === 'gu' ? 'ઓનલાઈન અરજી કરો' : language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>

              <WhatsAppShareButton
                title={`Kisan Yojana: ${getSchemeName(scheme)}`}
                text={`Check details for ${getSchemeName(scheme)} on Smart Krushi: ${getSchemeBenefit(scheme)}. Official portal: ${scheme.portalUrl}`}
                className="!py-2 !px-3 text-xs"
                showLabel={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Eligibility Checker Modal */}
      {isCheckerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-surface-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCheckerOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-700 text-lg p-2"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold mb-1">
              <FaUserCheck />
              <span>Smart Eligibility Engine</span>
            </div>
            <h2 className="text-xl font-black text-surface-900">
              {language === 'gu'
                ? 'કિસાન યોજના યોગ્યતા પરીક્ષક'
                : language === 'hi'
                ? 'किसान योजना पात्रता जांच'
                : 'Interactive Eligibility Checker'}
            </h2>
            <p className="text-xs text-surface-500 mb-5">
              Answer 3 simple questions to see which Central and Gujarat schemes you qualify for.
            </p>

            {/* Questions Form */}
            <div className="space-y-4 text-xs font-semibold">
              {/* Question 1: Land Size */}
              <div>
                <label className="block text-surface-700 mb-1.5 font-bold">
                  1. {language === 'gu' ? 'તમારું જમીન ક્ષેત્રફળ કેટલું છે?' : language === 'hi' ? 'आपकी ज़मीन कितनी है?' : 'What is your landholding size?'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Small', label: '< 2 Hectares (Small/Marginal)' },
                    { id: 'Medium', label: '2 - 5 Hectares (Medium)' },
                    { id: 'Large', label: '> 5 Hectares (Large)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEligibilityAnswers(prev => ({ ...prev, landCategory: opt.id }))}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        eligibilityAnswers.landCategory === opt.id
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-surface-50 text-surface-700 border-surface-200 hover:border-emerald-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Benefit Type */}
              <div>
                <label className="block text-surface-700 mb-1.5 font-bold">
                  2. {language === 'gu' ? 'તમને કેવા પ્રકારની સહાયની જરૂર છે?' : language === 'hi' ? 'आपको किस तरह की सहायता चाहिए?' : 'What benefit are you seeking?'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: '💵 Direct Cash / DBT (PM-KISAN)' },
                    { id: 'solar_pump', label: '☀️ Solar Pump / Drip Irrigation' },
                    { id: 'insurance', label: '🛡️ Crop Loss Insurance (PMFBY)' },
                    { id: 'equipment', label: '🚜 Tractor & Farm Tools Subsidy' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setEligibilityAnswers(prev => ({ ...prev, benefitType: b.id }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        eligibilityAnswers.benefitType === b.id
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-surface-50 text-surface-700 border-surface-200 hover:border-emerald-400'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: State */}
              <div>
                <label className="block text-surface-700 mb-1.5 font-bold">
                  3. {language === 'gu' ? 'તમારું રાજ્ય કયું છે?' : language === 'hi' ? 'आपका राज्य कौन सा है?' : 'Select your State / Region'}
                </label>
                <select
                  value={eligibilityAnswers.state}
                  onChange={(e) => setEligibilityAnswers(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-surface-300 text-surface-900 shadow-sm font-semibold"
                >
                  <option value="Gujarat">Gujarat (ગુજરાત - i-Khedut Eligible)</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Other">Other States</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunEligibilityChecker}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all mt-2"
              >
                {language === 'gu' ? 'યોગ્ય યોજનાઓ શોધો' : language === 'hi' ? 'योग्य योजनाएं देखें' : 'Find Matching Eligible Schemes'}
              </button>
            </div>

            {/* Checker Results */}
            {checkerMatched !== null && (
              <div className="mt-5 pt-4 border-t border-surface-200">
                <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                  <FaCheckCircle />
                  <span>Found {checkerMatched.length} Qualifying Schemes:</span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {checkerMatched.length === 0 ? (
                    <p className="text-xs text-surface-500">No matching schemes found for this exact combination.</p>
                  ) : (
                    checkerMatched.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-surface-900">{getSchemeName(m)}</div>
                          <div className="text-[11px] text-surface-500">{m.badge}</div>
                        </div>
                        <a
                          href={m.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Apply
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
