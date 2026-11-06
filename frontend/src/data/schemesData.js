/**
 * Smart Krushi Bazar - Official Government Agriculture Schemes Database (2026)
 * Features Central Government & Government of Gujarat (i-Khedut) Portals
 */
export const SCHEMES_DATABASE = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi Yojana',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि योजना',
    gujaratiName: 'પ્રધાનમંત્રી કિસાન સન્માન નિધિ યોજના',
    category: 'Financial Assistance',
    categoryHi: 'वित्तीय सहायता',
    categoryGu: 'નાણાકીય સહાય',
    level: 'Central',
    benefit: '₹6,000 per year directly credited in 3 equal installments (₹2,000 each) into Aadhaar-seeded bank accounts.',
    benefitHi: '₹6,000 प्रति वर्ष 3 समान किश्तों में (प्रत्येक ₹2,000) सीधे आधार से जुड़े बैंक खाते में।',
    benefitGu: 'વાર્ષિક ₹6,000 સીધા આધાર-લિંક્ડ બેંક ખાતામાં 3 હપ્તામાં (દરેક ₹2,000) જમા.',
    eligibilitySummary: 'All landholding farmer families with cultivable landholding in their names across India.',
    eligibilityCriteria: {
      maxLandHectares: 100, // all landholders
      types: ['Small', 'Medium', 'Large'],
      benefitsWanted: ['cash']
    },
    documents: ['Aadhaar Card', '7/12 & 8-A Land Record / Khatauni', 'Bank Passbook / IFSC Code', 'Mobile linked to Aadhaar'],
    portalUrl: 'https://pmkisan.gov.in',
    portalName: 'PM-KISAN Portal',
    badge: 'Direct DBT Transfer'
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना',
    gujaratiName: 'પ્રધાનમંત્રી પાક વીમા યોજના',
    category: 'Crop Insurance',
    categoryHi: 'फसल बीमा',
    categoryGu: 'પાક વીમો',
    level: 'Central',
    benefit: 'Comprehensive crop insurance against non-preventable natural risks (drought, flood, unseasonal rain, cyclone). Farmer premium only 1.5% - 2%.',
    benefitHi: 'प्राकृतिक आपदाओं (सूखा, बाढ़, बेमौसम बारिश) से फसल सुरक्षा। किसान प्रीमियम केवल 1.5% से 2%।',
    benefitGu: 'કુદરતી આફતો (દુષ્કાળ, પૂર, કમોસમી વરસાદ) સામે સંપૂર્ણ પાક સુરક્ષા. ખેડૂત પ્રીમિયમ માત્ર 1.5% થી 2%.',
    eligibilitySummary: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
    eligibilityCriteria: {
      maxLandHectares: 100,
      types: ['Small', 'Medium', 'Large'],
      benefitsWanted: ['insurance']
    },
    documents: ['Aadhaar Card', 'Land Sowing Certificate (Talaati Vevetar Dakhalo)', 'Bank Account Details', 'Kisan Credit Card (if loanee)'],
    portalUrl: 'https://pmfby.gov.in',
    portalName: 'PMFBY Portal',
    badge: '1.5% Low Premium'
  },
  {
    id: 'ikhedut-drip-subsidy',
    name: 'Gujarat Micro Irrigation (GGRC) Drip Subsidy',
    hindiName: 'गुजरात सूक्ष्म सिंचाई (ड्रिप) सब्सिडी',
    gujaratiName: 'ગુજરાત માઇક્રો ઇરીગેશન (ટપક પદ્ધતિ) સહાય',
    category: 'Solar & Irrigation',
    categoryHi: 'सौर एवं सिंचाई',
    categoryGu: 'સોલાર અને સિંચાઈ',
    level: 'Gujarat State',
    benefit: 'Up to 70% to 85% government subsidy on Drip and Sprinkler irrigation systems to conserve water and boost crop yield.',
    benefitHi: 'ड्रिप एवं फव्वारा सिंचाई प्रणाली पर 70% से 85% तक सरकारी सब्सिडी।',
    benefitGu: 'ટપક અને ફુવારા પદ્ધતિ સ્થાપવા પર 70% થી 85% સુધી સરકારી સબસિડી સહાય.',
    eligibilitySummary: 'Farmers in Gujarat with verified farm well, tubewell or canal water source having land in their name.',
    eligibilityCriteria: {
      maxLandHectares: 50,
      types: ['Small', 'Medium', 'Large'],
      benefitsWanted: ['solar_pump', 'equipment']
    },
    documents: ['7/12 & 8-A Land Extract', 'Electricity bill or NOC for water source', 'Aadhaar Card', 'Soil & Water test report'],
    portalUrl: 'https://ikhedut.gujarat.gov.in',
    portalName: 'i-Khedut Gujarat Portal',
    badge: '70-85% Subsidy'
  },
  {
    id: 'pm-kusum-solar',
    name: 'PM-KUSUM Solar Agricultural Pump Scheme',
    hindiName: 'पीएम-कुसुम सौर कृषि पंप योजना',
    gujaratiName: 'પીએમ-કુસુમ સોલાર કૃષિ પંપ યોજના',
    category: 'Solar & Irrigation',
    categoryHi: 'सौर एवं सिंचाई',
    categoryGu: 'સોલાર અને સિંચાઈ',
    level: 'Central & State',
    benefit: '60% government subsidy (30% Central + 30% State) for off-grid stand-alone solar water pumps (3HP, 5HP, 7.5HP). Farmer pays only 10%.',
    benefitHi: 'स्टैंड-अलोन सौर कृषि पंप पर 60% सब्सिडी (30% केंद्र + 30% राज्य)। किसान को केवल 10% देना होगा।',
    benefitGu: 'સોલાર એગ્રીકલ્ચર પંપ લગાવવા પર 60% સુધી સરકારી સબસિડી. ખેડૂતે માત્ર 10% જ ચૂકવવાના.',
    eligibilitySummary: 'Individual farmers, groups, cooperatives, and water user associations.',
    eligibilityCriteria: {
      maxLandHectares: 100,
      types: ['Small', 'Medium'],
      benefitsWanted: ['solar_pump']
    },
    documents: ['Land Records (7/12 & 8-A)', 'Aadhaar Card', 'Bank Passbook', 'Passport Size Photo'],
    portalUrl: 'https://pmkusum.mnre.gov.in',
    portalName: 'MNRE KUSUM Portal',
    badge: 'Solar Green Energy'
  },
  {
    id: 'ikhedut-tractor-tools',
    name: 'Gujarat Farm Mechanization (Tractor & Implements)',
    hindiName: 'गुजरात कृषि यंत्रीकरण (ट्रैक्टर एवं उपकरण) सहायता',
    gujaratiName: 'ગુજરાત ટ્રેક્ટર અને કૃષિ ઓજાર સહાય યોજના',
    category: 'Farm Machinery',
    categoryHi: 'कृषि उपकरण',
    categoryGu: 'કૃષિ યંત્ર સાધનો',
    level: 'Gujarat State',
    benefit: '₹45,000 to ₹60,000 subsidy on Mini Tractors (up to 20 PTO HP) and 40-50% subsidy on Rotavators, Cultivators, and Seed Drills.',
    benefitHi: 'मिनी ट्रैक्टर पर ₹45,000 से ₹60,000 की सब्सिडी और रोटावेटर, कल्टीवेटर पर 40-50% सहायता।',
    benefitGu: 'મિની ટ્રેક્ટર ખરીદી પર ₹45,000 થી ₹60,000 અને રોટાવેટર/ઓજાર પર 40-50% સહાય.',
    eligibilitySummary: 'Farmers in Gujarat registered on the i-Khedut portal with valid 8-A land registration.',
    eligibilityCriteria: {
      maxLandHectares: 20,
      types: ['Small', 'Medium'],
      benefitsWanted: ['equipment']
    },
    documents: ['i-Khedut Online Application receipt', 'Aadhaar Card', '7/12 & 8-A Land copy', 'Valid Quotation from authorized dealer'],
    portalUrl: 'https://ikhedut.gujarat.gov.in',
    portalName: 'i-Khedut Portal',
    badge: 'i-Khedut Verified'
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme (SHC)',
    hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
    gujaratiName: 'જમીન આરોગ્ય પત્રિકા (સોઇલ હેલ્થ કાર્ડ) યોજના',
    category: 'Soil & Testing',
    categoryHi: 'मिट्टी परीक्षण',
    categoryGu: 'જમીન ચકાસણી',
    level: 'Central',
    benefit: 'Free testing of 12 critical soil parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) with tailored dosage recommendations.',
    benefitHi: '12 महत्वपूर्ण मिट्टी मापदंडों का नि:शुल्क परीक्षण और अनुकूलित पोषक तत्व सिफारिश।',
    benefitGu: '૧૨ મહત્વના પોષક તત્વોની વિનામૂલ્યે જમીન ચકાસણી અને ખાતર ભલામણ પત્રિકા.',
    eligibilitySummary: 'All agricultural landowners in India through village level soil testing campaigns.',
    eligibilityCriteria: {
      maxLandHectares: 100,
      types: ['Small', 'Medium', 'Large'],
      benefitsWanted: ['cash', 'insurance', 'equipment', 'solar_pump']
    },
    documents: ['Aadhaar Card', 'Farm Survey Number details', 'Soil Sample'],
    portalUrl: 'https://soilhealth.dac.gov.in',
    portalName: 'Soil Health Portal',
    badge: '100% Free'
  }
];
