/**
 * Smart Krushi Bazar - Produce & Farm Field (Khet) Traceability Registry
 * Single Source of Truth for matching authentic produce images with their verified agricultural khet/orchard photos.
 */

export const PRODUCE_TRACEABILITY_REGISTRY = [
  {
    id: 'mango',
    keywords: ['mango', 'alphonso', 'hapus', 'kesar', 'aam', 'valsad', 'valsadi'],
    cropLabel: 'Valsadi Alphonso (Hapus) Mangoes',
    cropLabelHi: 'वलसाडी हापुस आम',
    cropLabelGu: 'વલસાડી હાફૂસ કેરી',
    producePhoto: '/images/crops/mango_produce.jpg',
    produceFallback: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
    farmPhoto: '/images/farms/mango_khet.jpg',
    farmFallback: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=900&auto=format&fit=crop',
    farmLabel: 'Valsadi Alphonso Mango Orchard (Amrai)',
    farmLabelHi: 'वलसाडी हापुस आम का बाग (अमराई)',
    farmLabelGu: 'વલસાડી હાફૂસ કેરીની વાડી (આમ્રકુંજ)',
    category: 'Fruits',
    defaultLocation: 'Navsari / Valsad, South Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'chilli',
    keywords: ['chilli', 'chili', 'mirch', 'mirchi', 'hari mirch', 'green chilli', 'tikhi mirch'],
    cropLabel: 'Fresh Green Chilli (Hari Mirch)',
    cropLabelHi: 'ताज़ा हरी मिर्च',
    cropLabelGu: 'તાજા લીલા મરચાં',
    producePhoto: '/images/crops/chilli_produce.jpg',
    produceFallback: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    farmPhoto: '/images/farms/chilli_khet.jpg',
    farmFallback: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=900&auto=format&fit=crop',
    farmLabel: 'Green Chilli Agricultural Farm (Hari Mirch ka Khet)',
    farmLabelHi: 'हरी मिर्च का सिंचित खेत',
    farmLabelGu: 'લીલા મરચાંનું સીંચિત ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'tomato',
    keywords: ['tomato', 'tamatar', 'tameta', 'desi tamatar'],
    cropLabel: 'Fresh Organic Tomatoes (Tamatar)',
    cropLabelHi: 'ताज़ा देशी टमाटर',
    cropLabelGu: 'તાજા દેશી ટામેટાં',
    producePhoto: '/images/crops/tomato_produce.jpg',
    produceFallback: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    farmPhoto: '/images/farms/tomato_khet.jpg',
    farmFallback: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=900&auto=format&fit=crop',
    farmLabel: 'Staked Organic Tomato Farm Field',
    farmLabelHi: 'टमाटर का मचानदार जैविक खेत',
    farmLabelGu: 'ટામેટાંનું મંચનદાર જૈવિક ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'wheat',
    keywords: ['wheat', 'gehun', 'sharbati', 'ghau'],
    cropLabel: 'Sharbati Wheat (Gehun) - Grade A',
    cropLabelHi: 'शरबती गेहूं (ग्रेड ए)',
    cropLabelGu: 'શરબતી ઘઉં (ગ્રેડ એ)',
    producePhoto: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop',
    farmLabel: 'Golden Sharbati Wheat Farmland',
    farmLabelHi: 'सुनहरा शरबती गेहूं का खेत',
    farmLabelGu: 'સોનેરી શરબતી ઘઉંનું ખેતર',
    category: 'Grains',
    defaultLocation: 'Anand / Navsari, Gujarat, India',
    gps: { lat: 22.5645, lng: 72.9289 }
  },
  {
    id: 'rice',
    keywords: ['rice', 'basmati', 'paddy', 'dhan', 'chawal', 'kolam', 'daangar'],
    cropLabel: 'Organic Basmati Paddy (Dhan)',
    cropLabelHi: 'जैविक बासमती धान',
    cropLabelGu: 'જૈવિક બાસમતી ડાંગર',
    producePhoto: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=900&auto=format&fit=crop',
    farmLabel: 'Green Organic Basmati Rice Paddy Terraces',
    farmLabelHi: 'बासमती धान का हरा-भरा खेत',
    farmLabelGu: 'બાસમતી ડાંગરનું લીલુંછમ ખેતર',
    category: 'Grains',
    defaultLocation: 'Kheda / Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'orange',
    keywords: ['orange', 'santra', 'citrus', 'mosambi', 'nagpur'],
    cropLabel: 'Juicy Nagpur Oranges (Santra)',
    cropLabelHi: 'रसीले नागपुरी संतरे',
    cropLabelGu: 'રસદાર નાગપુરી સંતરા',
    producePhoto: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=900&auto=format&fit=crop',
    farmLabel: 'Sunlit Citrus Orange Orchard Grove',
    farmLabelHi: 'संतरे का फला-फूला बगीचा',
    farmLabelGu: 'સંતરાનો ફળોથી લદાયેલો બગીચો',
    category: 'Fruits',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'chana',
    keywords: ['chana', 'gram', 'bengal gram', 'chickpea', 'desi chana', 'chole'],
    cropLabel: 'Desi Chana (Bengal Gram)',
    cropLabelHi: 'देशी चना',
    cropLabelGu: 'દેશી ચણા',
    producePhoto: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
    farmLabel: 'Desi Chana & Pulse Farmland',
    farmLabelHi: 'चना व दलहन का उपजाऊ खेत',
    farmLabelGu: 'ચણા અને કઠોળનું ઉપજાઉ ખેતર',
    category: 'Pulses',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'tur',
    keywords: ['tur', 'arhar', 'toor', 'tuver', 'pigeon pea', 'tuver dal'],
    cropLabel: 'Gujarat Tur Dal (Arhar)',
    cropLabelHi: 'गुजरात तूर दाल (अरहर)',
    cropLabelGu: 'ગુજરાત તુવેર દાળ',
    producePhoto: 'https://images.unsplash.com/photo-1585641778939-d3e9112bf703?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1585641778939-d3e9112bf703?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
    farmLabel: 'Tuver / Arhar Dal Pulse Crop Farmland',
    farmLabelHi: 'तुवर/अरहर दाल का खेत',
    farmLabelGu: 'તુવેર દાળનું કઠોળ ખેતર',
    category: 'Pulses',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'onion',
    keywords: ['onion', 'pyaz', 'kanda', 'dungri'],
    cropLabel: 'Fresh Desi Red Onions (Pyaz)',
    cropLabelHi: 'देशी लाल प्याज',
    cropLabelGu: 'દેશી લાલ ડુંગળી',
    producePhoto: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900&auto=format&fit=crop',
    farmLabel: 'Desi Onion Crop Field Rows',
    farmLabelHi: 'प्याज का सिंचित कतारबद्ध खेत',
    farmLabelGu: 'ડુંગળીનું સિંચિત કતારબદ્ધ ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Bhavnagar / Navsari, Gujarat, India',
    gps: { lat: 21.7645, lng: 72.1519 }
  },
  {
    id: 'potato',
    keywords: ['potato', 'aloo', 'batata'],
    cropLabel: 'Fresh Farm Potatoes (Aloo)',
    cropLabelHi: 'ताज़ा खेत के आलू',
    cropLabelGu: 'તાજા ખેતરના બટાટા',
    producePhoto: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop',
    farmLabel: 'Potato Farm Ridge Soil Rows',
    farmLabelHi: 'आलू का खेत',
    farmLabelGu: 'બટાટાનું ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Deesa / Navsari, Gujarat, India',
    gps: { lat: 24.2585, lng: 72.1798 }
  },
  {
    id: 'capsicum',
    keywords: ['capsicum', 'bell pepper', 'shimla mirch'],
    cropLabel: 'Farm Fresh Green Capsicum',
    cropLabelHi: 'हरी शिमला मिर्च',
    cropLabelGu: 'લીલા કેપ્સિકમ (શિમલા મરચાં)',
    producePhoto: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=900&auto=format&fit=crop',
    farmLabel: 'Polyhouse Green Capsicum Crop Rows',
    farmLabelHi: 'पॉलीहाउस शिमला मिर्च का खेत',
    farmLabelGu: 'પોલીહાઉસ શિમલા મરચાંનું ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Surat / Navsari, Gujarat, India',
    gps: { lat: 21.1702, lng: 72.8311 }
  },
  {
    id: 'turmeric',
    keywords: ['turmeric', 'haldi'],
    cropLabel: 'Pure Organic Lakadong Turmeric',
    cropLabelHi: 'जैविक हल्दी',
    cropLabelGu: 'શુદ્ધ જૈવિક હળદર',
    producePhoto: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop',
    farmLabel: 'Organic Turmeric Farmland',
    farmLabelHi: 'हल्दी का खेत',
    farmLabelGu: 'હળદરનું ખેતર',
    category: 'Pulses',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  },
  {
    id: 'cabbage',
    keywords: ['cabbage', 'patta gobi', 'kobi'],
    cropLabel: 'Fresh Crisp Cabbage',
    cropLabelHi: 'ताज़ा पत्तागोभी',
    cropLabelGu: 'તાજી કોબીજ',
    producePhoto: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80',
    produceFallback: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80',
    farmPhoto: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=900&auto=format&fit=crop',
    farmFallback: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=900&auto=format&fit=crop',
    farmLabel: 'Open Field Cabbage Furrow Rows',
    farmLabelHi: 'पत्तागोभी का खुला खेत',
    farmLabelGu: 'કોબીજનું ખુલ્લું ખેતર',
    category: 'Vegetables',
    defaultLocation: 'Navsari, Gujarat, India',
    gps: { lat: 20.9467, lng: 72.9520 }
  }
];

const DEFAULT_ENTRY = PRODUCE_TRACEABILITY_REGISTRY[0]; // Mango fallback

/**
 * Match a produce entry by name or keywords
 */
export function findProduceEntry(nameOrItem) {
  if (!nameOrItem) return DEFAULT_ENTRY;
  
  const searchString = (
    typeof nameOrItem === 'string'
      ? nameOrItem
      : (nameOrItem.productName || nameOrItem.name || nameOrItem.productId?.name || '')
  ).toLowerCase();

  const match = PRODUCE_TRACEABILITY_REGISTRY.find(entry =>
    entry.keywords.some(k => searchString.includes(k))
  );

  return match || DEFAULT_ENTRY;
}

/**
 * Resolves the genuine produce image (basket / harvested crop)
 */
export function resolveProduceImage(item) {
  if (!item) return DEFAULT_ENTRY.producePhoto;

  // Direct product image if provided and valid
  const directImg = typeof item === 'string' ? null : (item.image || item.productImage || item.productId?.image);
  if (directImg && directImg.length > 10 && !directImg.includes('placeholder')) {
    return directImg;
  }

  const entry = findProduceEntry(item);
  return entry.producePhoto || entry.produceFallback;
}

/**
 * Resolves the genuine authentic farm field (khet / orchard) photograph
 */
export function resolveFarmPhoto(item) {
  if (!item) return { photo: DEFAULT_ENTRY.farmPhoto, label: DEFAULT_ENTRY.farmLabel, entry: DEFAULT_ENTRY };

  // If a distinct farmPhoto is explicitly set in DB and not identical to produce image
  const dbFarmPhoto = typeof item === 'string' ? null : (item.farmPhoto || item.productId?.farmPhoto);
  const produceImg = typeof item === 'string' ? null : (item.image || item.productImage || item.productId?.image);

  if (dbFarmPhoto && dbFarmPhoto.length > 10 && dbFarmPhoto !== produceImg) {
    const entry = findProduceEntry(item);
    return {
      photo: dbFarmPhoto,
      label: entry ? entry.farmLabel : 'Verified Farm Field View',
      entry
    };
  }

  const entry = findProduceEntry(item);
  return {
    photo: entry.farmPhoto || entry.farmFallback,
    label: entry.farmLabel,
    entry
  };
}

/**
 * Returns complete combined traceability bundle for an order or product
 */
export function getProduceTraceability(item) {
  const entry = findProduceEntry(item);
  const producePhoto = resolveProduceImage(item);
  const farmPhotoData = resolveFarmPhoto(item);

  return {
    entry,
    cropLabel: entry.cropLabel,
    producePhoto,
    farmPhoto: farmPhotoData.photo,
    farmLabel: farmPhotoData.label,
    gps: entry.gps,
    location: entry.defaultLocation
  };
}
