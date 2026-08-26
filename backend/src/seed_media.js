const mongoose = require('mongoose');

const curatedProducts = [
  {
    name: 'Gir Organic Kesar Mangoes',
    category: 'Fruits',
    price: 350,
    quantity: 120,
    unit: 'box (3kg)',
    location: 'Junagadh, Gujarat',
    description: 'Naturally ripened, sweet & aromatic export-grade Kesar mangoes directly harvested from Gir orchards.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Desi Farm Fresh Tomatoes',
    category: 'Vegetables',
    price: 30,
    quantity: 350,
    unit: 'kg',
    location: 'Navsari, Gujarat',
    description: 'Juicy, vine-ripened organic red tomatoes harvested daily morning with 0 chemical sprays.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Golden Sharbati Wheat',
    category: 'Grains',
    price: 48,
    quantity: 800,
    unit: 'kg',
    location: 'Anand, Gujarat',
    description: 'Premium quality golden harvest Sharbati wheat, sun-dried and cleaned for soft rotis.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Organic Pahadi Red Apples',
    category: 'Fruits',
    price: 160,
    quantity: 200,
    unit: 'kg',
    location: 'Himachal Orchard Trade, Direct Mandi',
    description: 'Crisp, sweet, organic Himalayan apples hand-picked and cold-stored for supreme freshness.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Farm Fresh Green Capsicum',
    category: 'Vegetables',
    price: 45,
    quantity: 180,
    unit: 'kg',
    location: 'Surat Polyhouse, Gujarat',
    description: 'Polyhouse grown, crisp and glossy green bell peppers perfect for retail and restaurant supply.',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Pure Organic Lakadong Turmeric',
    category: 'Pulses',
    price: 120,
    quantity: 150,
    unit: 'pack (500g)',
    location: 'Mehsana Farm, Gujarat',
    description: 'High curcumin raw organic turmeric root & powder, naturally ground and certified chemical-free.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Fresh Crisp Cabbage',
    category: 'Vegetables',
    price: 25,
    quantity: 400,
    unit: 'piece',
    location: 'Vadodara Farm, Gujarat',
    description: 'Tightly packed, pesticide-free fresh green cabbage heads direct from the field.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Desi Red Onions (Nashik Quality)',
    category: 'Vegetables',
    price: 35,
    quantity: 600,
    unit: 'kg',
    location: 'Bhavnagar, Gujarat',
    description: 'Long shelf-life, pungent organic red onions directly sorted and bagged from farmers.',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Royal Basmati Grain Rice',
    category: 'Grains',
    price: 95,
    quantity: 500,
    unit: 'kg',
    location: 'Kheda, Gujarat',
    description: 'Aromatic extra long grain traditional Basmati rice, aged 2 years for signature aroma.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Organic Green Moong Dal',
    category: 'Pulses',
    price: 110,
    quantity: 300,
    unit: 'kg',
    location: 'Rajkot, Gujarat',
    description: 'Unpolished, protein-rich whole green gram pulse directly harvested by certified organic farmers.',
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80'
  }
];

const curatedExperts = [
  {
    name: 'Dr. Vikas Patel',
    email: 'dr.vikas.patel@krushi.com',
    specialization: 'Plant Pathology & Fruit Diseases',
    qualification: 'Ph.D. Plant Pathology (NAU Navsari)',
    experienceYears: 14,
    consultationFee: 250,
    location: 'Navsari Agricultural University, Gujarat',
    bio: 'Senior agronomist with 14+ years advising over 5,000 farmers across Gujarat on orchard blight, viral leaf curl, and soil micro-nutrition.',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    isExpertVerified: true,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM - 11:00 AM', '03:00 PM - 04:00 PM']
  },
  {
    name: 'Dr. Ananya Desai',
    email: 'dr.ananya.desai@krushi.com',
    specialization: 'Entomology & Organic Pest Control',
    qualification: 'Ph.D. Agricultural Entomology (AAU Anand)',
    experienceYears: 12,
    consultationFee: 350,
    location: 'Anand Agricultural University, Gujarat',
    bio: 'Specialist in biological pest management, neem formulation bio-sprays, and integrated pest management (IPM) for cotton and vegetable crops.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    isExpertVerified: true,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM - 10:00 AM', '02:00 PM - 03:00 PM']
  },
  {
    name: 'Dr. Rameshwar Choudhary',
    email: 'dr.rameshwar@krushi.com',
    specialization: 'Soil Chemistry & Fertilizer Optimization',
    qualification: 'M.Sc. Soil Science & Agro-Chemistry',
    experienceYears: 18,
    consultationFee: 400,
    location: 'Junagadh Agricultural University, Gujarat',
    bio: 'Expert in NPK soil testing calibration, drip fertigation schedules, and organic compost rejuvenation for high-yield farming.',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    isExpertVerified: true,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['11:00 AM - 12:00 PM', '04:00 PM - 05:00 PM']
  },
  {
    name: 'Dr. Kisan Mitra (Free Advisory)',
    email: 'kisan.mitra@krushi.com',
    specialization: 'Government Subsidies & Basic Diagnostics',
    qualification: 'M.Sc. Agronomy',
    experienceYears: 8,
    consultationFee: 0,
    location: 'KVK Center, Gujarat',
    bio: 'Dedicated public extension officer providing complimentary guidance on PM-KISAN, crop insurance, and seasonal sowing techniques.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isExpertVerified: true,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00 AM - 10:00 AM', '01:00 PM - 02:00 PM']
  }
];

async function seedCleanMedia() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart_krushi_bazar');
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, role: String, profileImage: String,
    specialization: String, qualification: String, consultationFee: Number,
    experienceYears: Number, bio: String, location: String,
    isExpertVerified: Boolean, availableDays: [String], availableSlots: [String]
  }, { strict: false }));

  const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, description: String, category: String, price: Number,
    quantity: Number, unit: String, location: String, image: String,
    farmerId: mongoose.Schema.Types.ObjectId
  }, { strict: false }));

  // Find a farmer
  let farmer = await User.findOne({ role: 'Farmer' });
  if (!farmer) {
    console.log('No farmer found, creating default farmer');
    farmer = await User.create({
      name: 'Ramesh Patel',
      email: 'farmer_ramesh@krushi.com',
      password: '$2a$10$7wUQNa9bsVvELaykZBC6beBs4XIKQR6ue4XuTYudfi4DQK8ciNJti',
      role: 'Farmer',
      phone: '9876543210',
      location: 'Junagadh, Gujarat',
      farmName: 'Gir Organic Valley Farms',
      specialization: 'Organic Fruits & Grains',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
    });
  } else {
    await User.updateOne({ _id: farmer._id }, {
      $set: {
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        farmName: 'Gir Organic Valley Farms',
        specialization: 'Organic Fruits & Grains'
      }
    });
  }

  // Update existing products with real crisp photos or add curated products
  const existingProducts = await Product.find({});
  for (let i = 0; i < existingProducts.length; i++) {
    const cur = curatedProducts[i % curatedProducts.length];
    await Product.updateOne({ _id: existingProducts[i]._id }, {
      $set: {
        name: cur.name,
        category: cur.category,
        price: cur.price,
        quantity: cur.quantity,
        location: cur.location,
        description: cur.description,
        image: cur.image,
        unit: cur.unit || 'kg'
      }
    });
  }

  // If fewer than 8 products, insert the rest
  if (existingProducts.length < curatedProducts.length) {
    for (let i = existingProducts.length; i < curatedProducts.length; i++) {
      await Product.create({
        ...curatedProducts[i],
        farmerId: farmer._id
      });
    }
  }

  // Update Expert records with verified images & credentials
  const existingExperts = await User.find({ role: 'Expert' });
  for (let i = 0; i < existingExperts.length; i++) {
    const exp = curatedExperts[i % curatedExperts.length];
    await User.updateOne({ _id: existingExperts[i]._id }, {
      $set: {
        name: exp.name,
        specialization: exp.specialization,
        qualification: exp.qualification,
        experienceYears: exp.experienceYears,
        consultationFee: exp.consultationFee,
        location: exp.location,
        bio: exp.bio,
        profileImage: exp.profileImage,
        isExpertVerified: true,
        availableDays: exp.availableDays,
        availableSlots: exp.availableSlots
      }
    });
  }

  console.log('✅ Successfully updated database with rich HD agricultural images, crop listings & verified experts!');
  process.exit(0);
}

seedCleanMedia().catch(err => {
  console.error(err);
  process.exit(1);
});
