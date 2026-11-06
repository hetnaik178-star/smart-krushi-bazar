// Centralized Freight & Transport Calculator for Bulk Orders (>= 40 kg)

const DISTANCE_MATRIX = {
  'Navsari': { 'Surat': 38, 'Mumbai': 240, 'Ahmedabad': 295, 'Vadodara': 185, 'Rajkot': 480, 'Bharuch': 110, 'Vapi': 85, 'Pune': 370 },
  'Anand': { 'Surat': 150, 'Mumbai': 410, 'Ahmedabad': 75, 'Vadodara': 45, 'Rajkot': 270, 'Bharuch': 95, 'Vapi': 260, 'Pune': 540 },
  'Surat': { 'Surat': 15, 'Mumbai': 280, 'Ahmedabad': 265, 'Vadodara': 150, 'Rajkot': 450, 'Bharuch': 75, 'Vapi': 115, 'Pune': 410 },
  'Rajkot': { 'Surat': 450, 'Mumbai': 710, 'Ahmedabad': 215, 'Vadodara': 300, 'Rajkot': 15, 'Bharuch': 370, 'Vapi': 560, 'Pune': 840 },
  'Junagadh': { 'Surat': 510, 'Mumbai': 770, 'Ahmedabad': 310, 'Vadodara': 390, 'Rajkot': 105, 'Bharuch': 460, 'Vapi': 620, 'Pune': 900 },
  'Mehsana': { 'Surat': 330, 'Mumbai': 590, 'Ahmedabad': 75, 'Vadodara': 180, 'Rajkot': 280, 'Bharuch': 250, 'Vapi': 440, 'Pune': 710 },
  'Vadodara': { 'Surat': 150, 'Mumbai': 400, 'Ahmedabad': 110, 'Vadodara': 15, 'Rajkot': 290, 'Bharuch': 70, 'Vapi': 250, 'Pune': 530 },
  'Nashik': { 'Surat': 230, 'Mumbai': 165, 'Ahmedabad': 480, 'Vadodara': 370, 'Rajkot': 690, 'Bharuch': 300, 'Vapi': 140, 'Pune': 210 }
};

function calculateOrderFreight(weightKg, originLocation = 'Navsari', destinationLocation = 'Surat', category = 'Vegetables') {
  const weight = Number(weightKg) || 0;

  // Retail household orders under 40 kg enjoy standard free delivery
  if (weight < 40) {
    return {
      isBulk: false,
      weightKg: weight,
      freightAmount: 0,
      vehicleName: 'Standard Farm Express',
      vehicleIcon: '🛵',
      distanceKm: 0,
      baseFare: 0,
      hamali: 0,
      perishableCare: 0,
      toll: 0,
      description: 'Retail Home Order (< 40 kg): Free Delivery'
    };
  }

  // Find origin key in distance matrix
  let originKey = 'Navsari';
  const normOrigin = (originLocation || '').toLowerCase();
  for (const k of Object.keys(DISTANCE_MATRIX)) {
    if (normOrigin.includes(k.toLowerCase())) {
      originKey = k;
      break;
    }
  }

  // Find destination key in distance matrix
  let destKey = 'Surat';
  const normDest = (destinationLocation || '').toLowerCase();
  for (const k of Object.keys(DISTANCE_MATRIX['Navsari'])) {
    if (normDest.includes(k.toLowerCase())) {
      destKey = k;
      break;
    }
  }

  const distanceKm = DISTANCE_MATRIX[originKey]?.[destKey] || 38;

  // Select commercial vehicle based on weight sequence
  let vehicle;
  if (weight <= 500) {
    // 40 kg to 500 kg: 3-Wheeler Cargo
    vehicle = {
      name: '3-Wheeler Cargo (Piaggio Ape)',
      icon: '🛺',
      baseFare: 350,
      perKm: 14
    };
  } else if (weight <= 1500) {
    // 500 kg to 1.5 Tonnes: Tata Ace / Chhota Hathi
    vehicle = {
      name: 'Tata Ace / Chhota Hathi',
      icon: '🛻',
      baseFare: 700,
      perKm: 20
    };
  } else if (weight <= 7000) {
    // 1.5 Tonnes to 7 Tonnes: Eicher Truck
    vehicle = {
      name: 'Eicher 14ft / 19ft Commercial Truck',
      icon: '🚚',
      baseFare: 1800,
      perKm: 34
    };
  } else {
    // 7+ Tonnes: Heavy 10-Wheeler Truck
    vehicle = {
      name: '10-Wheeler Heavy Commercial Truck',
      icon: '🚛',
      baseFare: 4000,
      perKm: 58
    };
  }

  const baseFare = vehicle.baseFare + (distanceKm * vehicle.perKm);
  const hamali = Math.round(weight * 0.25); // ₹0.25/kg labor loading/unloading
  const isPerishable = category === 'Vegetables' || category === 'Fruits';
  const perishableCare = isPerishable ? Math.round(baseFare * 0.12) : 0;
  const toll = distanceKm > 100 ? Math.round((distanceKm / 65) * 85) : 0;

  const totalFreight = Math.round(baseFare + hamali + perishableCare + toll);
  const costPerKg = (totalFreight / weight).toFixed(2);

  return {
    isBulk: true,
    weightKg: weight,
    freightAmount: totalFreight,
    costPerKg,
    vehicleName: vehicle.name,
    vehicleIcon: vehicle.icon,
    distanceKm,
    origin: originKey,
    destination: destKey,
    baseFare,
    hamali,
    perishableCare,
    toll,
    description: `Commercial Bulk Transport (≥ 40 kg): ${vehicle.name} (${distanceKm} km from ${originKey} to ${destKey})`
  };
}

module.exports = {
  calculateOrderFreight,
  DISTANCE_MATRIX
};
