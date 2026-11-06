/**
 * Crop Recommendation Knowledge Base & Algorithmic Scoring Engine
 * Calibrated against ICAR (Indian Council of Agricultural Research) agronomy standards
 * for prominent Indian & Gujarat crops.
 */

const CROP_DATABASE = [
  {
    id: 'wheat',
    name: 'Wheat (Sharbati / Lokwan)',
    hindiName: 'गेहूं (शरबती / लोकवन)',
    gujaratiName: 'ઘઉં (ટુકડી / લોકવન)',
    category: 'Grains',
    optimalN: { min: 80, max: 130, ideal: 105 },
    optimalP: { min: 40, max: 70, ideal: 55 },
    optimalK: { min: 30, max: 60, ideal: 45 },
    optimalPH: { min: 6.0, max: 7.5, ideal: 6.8 },
    soilTypes: ['Alluvial', 'Clay Loam', 'Loamy', 'Black'],
    seasons: ['Rabi'],
    waterReq: 'Medium',
    durationDays: '110 - 125 Days',
    yieldPerAcre: '20 - 26 Quintals',
    profitPerAcre: '₹35,000 - ₹48,000',
    keyTip: 'Ensure 4-5 irrigations, critical during Crown Root Initiation (21 days) and Flowering stage.',
    icon: '🌾'
  },
  {
    id: 'paddy',
    name: 'Paddy / Basmati Rice',
    hindiName: 'धान / बासमती चावल',
    gujaratiName: 'ડાંગર / બાસમતી ચોખા',
    category: 'Grains',
    optimalN: { min: 90, max: 140, ideal: 115 },
    optimalP: { min: 35, max: 65, ideal: 50 },
    optimalK: { min: 35, max: 70, ideal: 50 },
    optimalPH: { min: 5.5, max: 7.2, ideal: 6.5 },
    soilTypes: ['Clay', 'Clay Loam', 'Alluvial'],
    seasons: ['Kharif'],
    waterReq: 'High',
    durationDays: '120 - 140 Days',
    yieldPerAcre: '24 - 32 Quintals',
    profitPerAcre: '₹42,000 - ₹58,000',
    keyTip: 'Maintain 3-5cm standing water during panicle initiation; apply zinc sulfate @ 10kg/acre for blast protection.',
    icon: '🌾'
  },
  {
    id: 'cotton',
    name: 'Bt Cotton (Kapasiya)',
    hindiName: 'कपास (कॉटन)',
    gujaratiName: 'કપાસ (બીટી કોટન)',
    category: 'Cash Crop',
    optimalN: { min: 90, max: 130, ideal: 110 },
    optimalP: { min: 40, max: 65, ideal: 50 },
    optimalK: { min: 40, max: 70, ideal: 55 },
    optimalPH: { min: 6.5, max: 8.5, ideal: 7.5 },
    soilTypes: ['Black', 'Deep Black', 'Alluvial', 'Loamy'],
    seasons: ['Kharif'],
    waterReq: 'Medium',
    durationDays: '150 - 180 Days',
    yieldPerAcre: '12 - 18 Quintals',
    profitPerAcre: '₹55,000 - ₹75,000',
    keyTip: 'Deep black soil provides excellent moisture retention. Spray Neem oil early for Pink Bollworm prevention.',
    icon: '☁️'
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Mungfali)',
    hindiName: 'मूंगफली (तिलहन)',
    gujaratiName: 'મગફળી (તેલીબિયાં)',
    category: 'Oilseeds',
    optimalN: { min: 20, max: 40, ideal: 25 },
    optimalP: { min: 40, max: 75, ideal: 55 },
    optimalK: { min: 30, max: 60, ideal: 45 },
    optimalPH: { min: 6.0, max: 7.5, ideal: 6.6 },
    soilTypes: ['Sandy Loam', 'Loamy', 'Red', 'Alluvial'],
    seasons: ['Kharif', 'Zaid'],
    waterReq: 'Low to Medium',
    durationDays: '105 - 120 Days',
    yieldPerAcre: '10 - 15 Quintals',
    profitPerAcre: '₹38,000 - ₹52,000',
    keyTip: 'Legume crop fixes atmospheric nitrogen. Apply Gypsum @ 100kg/acre at flowering to enhance pod development.',
    icon: '🥜'
  },
  {
    id: 'kesar_mango',
    name: 'Gir Kesar Mango',
    hindiName: 'गीर केसर आम',
    gujaratiName: 'ગીર કેસર કેરી',
    category: 'Fruits',
    optimalN: { min: 50, max: 100, ideal: 75 },
    optimalP: { min: 30, max: 60, ideal: 45 },
    optimalK: { min: 60, max: 120, ideal: 90 },
    optimalPH: { min: 6.0, max: 7.8, ideal: 7.0 },
    soilTypes: ['Alluvial', 'Black', 'Red', 'Loamy'],
    seasons: ['Year-Round', 'Zaid'],
    waterReq: 'Medium',
    durationDays: 'Perennial (Harvest in Summer)',
    yieldPerAcre: '40 - 60 Boxes (10kg each)',
    profitPerAcre: '₹95,000 - ₹1,60,000',
    keyTip: 'High potash requirement during fruit setting. Stop irrigation 3 weeks prior to harvesting for peak sweetness.',
    icon: '🥭'
  },
  {
    id: 'tomato',
    name: 'Hybrid Tomato (Abhinav / Vaishali)',
    hindiName: 'टमाटर (हाइब्रिड)',
    gujaratiName: 'ટામેટા (હાઇબ્રિડ)',
    category: 'Vegetables',
    optimalN: { min: 80, max: 130, ideal: 100 },
    optimalP: { min: 50, max: 80, ideal: 65 },
    optimalK: { min: 60, max: 110, ideal: 85 },
    optimalPH: { min: 6.0, max: 7.0, ideal: 6.5 },
    soilTypes: ['Loamy', 'Sandy Loam', 'Alluvial'],
    seasons: ['Rabi', 'Kharif', 'Zaid'],
    waterReq: 'Medium',
    durationDays: '90 - 110 Days',
    yieldPerAcre: '140 - 200 Quintals',
    profitPerAcre: '₹60,000 - ₹90,000',
    keyTip: 'Staking supports increase export-grade fruit yield by 35%. Drip fertigation with calcium nitrate prevents blossom rot.',
    icon: '🍅'
  },
  {
    id: 'onion',
    name: 'Red Onion (Nashik / Mahuva)',
    hindiName: 'लाल प्याज (कांदा)',
    gujaratiName: 'લાલ ડુંગળી (ડુંગળી)',
    category: 'Vegetables',
    optimalN: { min: 60, max: 100, ideal: 80 },
    optimalP: { min: 35, max: 65, ideal: 50 },
    optimalK: { min: 40, max: 80, ideal: 60 },
    optimalPH: { min: 6.2, max: 7.5, ideal: 6.8 },
    soilTypes: ['Sandy Loam', 'Clay Loam', 'Alluvial'],
    seasons: ['Rabi', 'Kharif'],
    waterReq: 'Medium',
    durationDays: '115 - 130 Days',
    yieldPerAcre: '80 - 120 Quintals',
    profitPerAcre: '₹45,000 - ₹70,000',
    keyTip: 'Requires well-drained soil. Sulphur @ 15kg/acre enhances pungency, bulb size, and shelf life for export.',
    icon: '🧅'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Co 86032 / Co 0238)',
    hindiName: 'गन्ना (शुगरकेन)',
    gujaratiName: 'શેરડી',
    category: 'Cash Crop',
    optimalN: { min: 110, max: 160, ideal: 140 },
    optimalP: { min: 50, max: 85, ideal: 70 },
    optimalK: { min: 80, max: 140, ideal: 110 },
    optimalPH: { min: 6.5, max: 8.0, ideal: 7.2 },
    soilTypes: ['Black', 'Deep Alluvial', 'Clay Loam'],
    seasons: ['Year-Round', 'Kharif'],
    waterReq: 'High',
    durationDays: '330 - 365 Days',
    yieldPerAcre: '400 - 550 Quintals',
    profitPerAcre: '₹80,000 - ₹1,20,000',
    keyTip: 'Apply bio-fertilizers (Acetobacter) to save 25% chemical urea. Trash mulching preserves soil moisture significantly.',
    icon: '🎋'
  },
  {
    id: 'cumin',
    name: 'Cumin Seeds (Jeera)',
    hindiName: 'जीरा (मसाला)',
    gujaratiName: 'જીરું (ઊંઝા સ્પેશિયલ)',
    category: 'Spices',
    optimalN: { min: 25, max: 45, ideal: 30 },
    optimalP: { min: 20, max: 40, ideal: 30 },
    optimalK: { min: 20, max: 45, ideal: 30 },
    optimalPH: { min: 7.0, max: 8.5, ideal: 7.8 },
    soilTypes: ['Sandy Loam', 'Loamy', 'Light Alluvial'],
    seasons: ['Rabi'],
    waterReq: 'Low',
    durationDays: '100 - 115 Days',
    yieldPerAcre: '4 - 7 Quintals',
    profitPerAcre: '₹65,000 - ₹1,10,000',
    keyTip: 'Extremely high export demand in Unjha Mandi. Avoid excess watering; prone to blight in high humidity.',
    icon: '🌿'
  },
  {
    id: 'chickpea',
    name: 'Gram / Chickpea (Chana)',
    hindiName: 'चना (देसी / काबुली)',
    gujaratiName: 'ચણા (દેશી / કાબુલી)',
    category: 'Pulses',
    optimalN: { min: 15, max: 35, ideal: 25 },
    optimalP: { min: 40, max: 70, ideal: 55 },
    optimalK: { min: 25, max: 50, ideal: 35 },
    optimalPH: { min: 6.0, max: 8.0, ideal: 7.2 },
    soilTypes: ['Black', 'Loamy', 'Clay Loam'],
    seasons: ['Rabi'],
    waterReq: 'Low',
    durationDays: '95 - 110 Days',
    yieldPerAcre: '8 - 12 Quintals',
    profitPerAcre: '₹28,000 - ₹42,000',
    keyTip: 'Ideal for residual moisture in Black cotton soils. Nipping at 35-40 days enhances branching and pod count.',
    icon: '🌱'
  },
  {
    id: 'maize',
    name: 'Hybrid Maize / Corn',
    hindiName: 'मक्का (मकई)',
    gujaratiName: 'મકાઈ (હાઇબ્રિડ)',
    category: 'Grains',
    optimalN: { min: 80, max: 120, ideal: 100 },
    optimalP: { min: 35, max: 60, ideal: 45 },
    optimalK: { min: 30, max: 55, ideal: 40 },
    optimalPH: { min: 5.8, max: 7.5, ideal: 6.5 },
    soilTypes: ['Alluvial', 'Red', 'Sandy Loam', 'Loamy'],
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    waterReq: 'Medium',
    durationDays: '85 - 100 Days',
    yieldPerAcre: '25 - 35 Quintals',
    profitPerAcre: '₹32,000 - ₹46,000',
    keyTip: 'Fast growing fodder & grain crop. Top dress nitrogen at knee-high and tasseling stages for heavy cobs.',
    icon: '🌽'
  },
  {
    id: 'potato',
    name: 'Potato (Kufri Badshah / Jyoti)',
    hindiName: 'आलू (कुफरी)',
    gujaratiName: 'બટાકા (ડીસા સ્પેશિયલ)',
    category: 'Vegetables',
    optimalN: { min: 90, max: 140, ideal: 120 },
    optimalP: { min: 60, max: 100, ideal: 80 },
    optimalK: { min: 70, max: 130, ideal: 100 },
    optimalPH: { min: 5.2, max: 6.8, ideal: 6.0 },
    soilTypes: ['Sandy Loam', 'Loamy', 'Alluvial'],
    seasons: ['Rabi'],
    waterReq: 'Medium',
    durationDays: '90 - 105 Days',
    yieldPerAcre: '120 - 180 Quintals',
    profitPerAcre: '₹50,000 - ₹85,000',
    keyTip: 'Deesa region in Gujarat is famous for chip-grade potatoes. Earthing up at 30 days protects tubers from greening.',
    icon: '🥔'
  }
];

/**
 * Score a single crop against farmer inputs
 */
function calculateCropScore(crop, { n, p, k, ph, soilType, season, waterAvailability }) {
  let score = 0;

  // 1. Nitrogen Fit (0 - 25 points)
  const nDiff = Math.abs(n - crop.optimalN.ideal);
  const nScore = Math.max(0, 25 - (nDiff / 4));
  score += nScore;

  // 2. Phosphorus Fit (0 - 20 points)
  const pDiff = Math.abs(p - crop.optimalP.ideal);
  const pScore = Math.max(0, 20 - (pDiff / 3.5));
  score += pScore;

  // 3. Potassium Fit (0 - 20 points)
  const kDiff = Math.abs(k - crop.optimalK.ideal);
  const kScore = Math.max(0, 20 - (kDiff / 4));
  score += kScore;

  // 4. Soil pH Fit (0 - 15 points)
  if (ph >= crop.optimalPH.min && ph <= crop.optimalPH.max) {
    const phDiff = Math.abs(ph - crop.optimalPH.ideal);
    score += Math.max(8, 15 - (phDiff * 7));
  } else {
    score += Math.max(0, 10 - (Math.abs(ph - crop.optimalPH.ideal) * 8));
  }

  // 5. Soil Type Match (0 - 10 points)
  if (soilType) {
    const match = crop.soilTypes.some(st => st.toLowerCase() === soilType.toLowerCase());
    score += match ? 10 : 3;
  } else {
    score += 7;
  }

  // 6. Season Compatibility (0 - 10 points)
  if (season) {
    if (crop.seasons.includes('Year-Round') || crop.seasons.some(s => s.toLowerCase() === season.toLowerCase())) {
      score += 10;
    } else {
      score += 2;
    }
  } else {
    score += 6;
  }

  // Water check bonus / penalty
  if (waterAvailability === 'Low' && crop.waterReq === 'High') {
    score -= 15;
  } else if (waterAvailability === 'High' && crop.waterReq === 'Low') {
    score -= 5;
  }

  // Clamp score between 40% and 98%
  return Math.min(98, Math.max(42, Math.round(score)));
}

/**
 * Recommend top 3 crops based on soil nutrients and regional context
 */
function recommendCrops({ n, p, k, ph, soilType, season, waterAvailability, state }) {
  const numN = Number(n) || 90;
  const numP = Number(p) || 45;
  const numK = Number(k) || 45;
  const numPH = Number(ph) || 6.8;

  const scored = CROP_DATABASE.map(crop => {
    const matchScore = calculateCropScore(crop, {
      n: numN,
      p: numP,
      k: numK,
      ph: numPH,
      soilType,
      season,
      waterAvailability
    });

    return {
      ...crop,
      matchScore
    };
  });

  // Sort descending by matchScore
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return {
    inputs: {
      n: numN,
      p: numP,
      k: numK,
      ph: numPH,
      soilType: soilType || 'Alluvial',
      season: season || 'Kharif',
      state: state || 'Gujarat'
    },
    topRecommendations: scored.slice(0, 3),
    otherOptions: scored.slice(3, 6)
  };
}

module.exports = {
  CROP_DATABASE,
  recommendCrops
};
