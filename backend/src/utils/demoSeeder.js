const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Smart Krushi Bazar - Viva Demo Data Seeder
 * Populates verified demo accounts, farm listings, and orders with GPS & traceability coordinates.
 */
async function seedDemoData() {
  // 1. Target Demo Users
  const demoUsers = [
    {
      name: 'Het Naik (Kisan)',
      email: 'hetnaik178@gmail.com',
      password: 'het@171925',
      role: 'Farmer',
      phone: '9876543210',
      location: 'Navsari, Gujarat',
      latitude: 20.9467,
      longitude: 72.9520,
      bio: 'Certified organic farmer producing premium Alphonso mangoes, sugarcane, and fresh vegetables with zero synthetic pesticides.',
      farmName: 'Het Organic Agro Farm & Orchards',
      specialization: 'Horticulture & Organic Sugarcane'
    },
    {
      name: 'Meet Naik (Wholesaler)',
      email: 'naikmeet2535@gmail.com',
      password: 'naikmeet2535',
      role: 'Buyer',
      phone: '9823456789',
      location: 'Bardoli, Gujarat',
      latitude: 21.1197,
      longitude: 73.1147,
      bio: 'Direct aggregator and wholesale supplier servicing retail networks and food processors across South Gujarat.'
    },
    {
      name: 'Dr. Jeet Patel',
      email: 'jeet@gmail.com',
      password: 'jeet123',
      role: 'Expert',
      phone: '9898989898',
      location: 'Anand Agricultural University, Gujarat',
      latitude: 22.5645,
      longitude: 72.9289,
      bio: 'Senior Agronomist specializing in soil health management, IPM (Integrated Pest Management), and precision fertilizer schedules.',
      qualification: 'Ph.D. Agronomy (AAU Anand)',
      experienceYears: 14,
      consultationFee: 199,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availableSlots: ['10:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'],
      isExpertVerified: true
    },
    {
      name: 'Platform Administrator',
      email: 'admin@krushi.com',
      password: 'Admin@123',
      role: 'Admin',
      phone: '9811122233',
      location: 'Surat, Gujarat',
      latitude: 21.1702,
      longitude: 72.8311,
      bio: 'Smart Krushi Bazar Platform Controller & Quality Assurance Lead.'
    }
  ];

  const seededUsers = {};

  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = new User(u);
      await user.save();
    } else {
      user.name = u.name;
      user.role = u.role;
      user.phone = u.phone;
      user.location = u.location;
      user.latitude = u.latitude;
      user.longitude = u.longitude;
      user.bio = u.bio;
      user.farmName = u.farmName || user.farmName;
      user.specialization = u.specialization || user.specialization;
      user.qualification = u.qualification || user.qualification;
      user.experienceYears = u.experienceYears || user.experienceYears;
      user.consultationFee = u.consultationFee || user.consultationFee;
      user.isExpertVerified = u.isExpertVerified !== undefined ? u.isExpertVerified : user.isExpertVerified;
      // Re-hash password if needed
      user.password = u.password;
      await user.save();
    }
    seededUsers[u.role] = user;
  }

  const farmer = seededUsers['Farmer'];
  const buyer = seededUsers['Buyer'];

  // 2. Clear old demo products for this farmer and repopulate fresh produce
  await Product.deleteMany({ farmerId: farmer._id });

  const demoProducts = [
    {
      name: 'Fresh Organic Tomatoes (Tamatar)',
      description: 'Vine-ripened, firm hybrid tomatoes harvested fresh every morning. Ideal for mandi wholesale and restaurants.',
      category: 'Vegetables',
      price: 28,
      quantity: 850,
      image: '/images/crops/tomato_produce.jpg',
      farmPhoto: '/images/farms/tomato_khet.jpg',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Valsadi Alphonso (Hapus) Mangoes',
      description: 'GI-tagged organic Valsadi Alphonso mangoes. Naturally tree-ripened without calcium carbide, sweet aroma and rich pulp.',
      category: 'Fruits',
      price: 120,
      quantity: 400,
      image: '/images/crops/mango_produce.jpg',
      farmPhoto: '/images/farms/mango_khet.jpg',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Sharbati Wheat (Gehun) - Grade A',
      description: 'Golden, heavy grains of premium Sharbati wheat from black cotton soil. Low moisture, 100% sortex cleaned.',
      category: 'Grains',
      price: 38,
      quantity: 2500,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
      farmPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Desi Chana (Bengal Gram)',
      description: 'Naturally sun-dried desi brown chickpea, rich in natural plant protein and high dietary fiber.',
      category: 'Pulses',
      price: 68,
      quantity: 1200,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80',
      farmPhoto: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Fresh Green Chilli (Hari Mirch)',
      description: 'Spicy, crisp G-4 variety green chillies freshly harvested for peak pungency and long shelf life.',
      category: 'Vegetables',
      price: 45,
      quantity: 350,
      image: '/images/crops/chilli_produce.jpg',
      farmPhoto: '/images/farms/chilli_khet.jpg',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Juicy Nagpur Oranges (Santra)',
      description: 'Sweet and tangy fresh citrus oranges directly from farm orchard. Rich in Vitamin C.',
      category: 'Fruits',
      price: 55,
      quantity: 600,
      image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
      farmPhoto: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=900&auto=format&fit=crop',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Organic Basmati Paddy (Dhan)',
      description: 'Traditional 1121 aromatic long-grain Basmati paddy, organically farmed with drip irrigation.',
      category: 'Grains',
      price: 42,
      quantity: 3000,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      farmPhoto: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=900&auto=format&fit=crop',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    },
    {
      name: 'Gujarat Tur Dal (Arhar)',
      description: 'Unpolished traditional yellow split pigeon peas (Tuver dal). No artificial coloring or oils.',
      category: 'Pulses',
      price: 135,
      quantity: 900,
      image: 'https://images.unsplash.com/photo-1585641778939-d3e9112bf703?w=600&auto=format&fit=crop&q=80',
      farmPhoto: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop',
      location: 'Navsari, Gujarat',
      farmerId: farmer._id,
      isActive: true
    }
  ];

  const createdProducts = await Product.insertMany(demoProducts);

  // 3. Clear old orders for this demo pair and insert traceable orders
  await Order.deleteMany({
    $or: [{ farmerId: farmer._id }, { buyerId: buyer._id }]
  });

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  // Fetch diverse buyers from database so orders reflect different customers
  const otherBuyers = await User.find({ role: 'Buyer', _id: { $ne: buyer._id } }).limit(6);
  const buyerList = [buyer, ...(otherBuyers || [])];
  const getBuyerId = (idx) => buyerList[idx % buyerList.length]._id;

  const demoOrders = [
    {
      productId: createdProducts[1]._id, // Alphonso Mangoes
      productName: createdProducts[1].name,
      productImage: createdProducts[1].image,
      farmPhoto: createdProducts[1].farmPhoto,
      buyerId: getBuyerId(0), // Meet Naik
      farmerId: farmer._id,
      quantity: 6,
      unitPrice: createdProducts[1].price,
      totalPrice: createdProducts[1].price * 6, // 120 * 6 = 720
      status: 'Completed',
      trackingStatus: 'DELIVERED',
      packedAt: threeDaysAgo,
      dispatchedAt: twoDaysAgo,
      deliveredAt: yesterday,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_001',
      razorpayPaymentId: 'pay_demo_v4_991823',
      verifiedAt: threeDaysAgo,
      createdAt: threeDaysAgo
    },
    {
      productId: createdProducts[0]._id, // Tomatoes
      productName: createdProducts[0].name,
      productImage: createdProducts[0].image,
      farmPhoto: createdProducts[0].farmPhoto,
      buyerId: getBuyerId(1), // Priya Sharma / Buyer 1
      farmerId: farmer._id,
      quantity: 15,
      unitPrice: createdProducts[0].price,
      totalPrice: createdProducts[0].price * 15, // 28 * 15 = 420
      status: 'Accepted',
      trackingStatus: 'DISPATCHED',
      packedAt: twoDaysAgo,
      dispatchedAt: yesterday,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_tom_01',
      razorpayPaymentId: 'pay_demo_v4_tom_01',
      verifiedAt: twoDaysAgo,
      createdAt: twoDaysAgo
    },
    {
      productId: createdProducts[2]._id, // Wheat
      productName: createdProducts[2].name,
      productImage: createdProducts[2].image,
      farmPhoto: createdProducts[2].farmPhoto,
      buyerId: getBuyerId(2), // Amit Retailer
      farmerId: farmer._id,
      quantity: 20,
      unitPrice: createdProducts[2].price,
      totalPrice: createdProducts[2].price * 20, // 38 * 20 = 760
      status: 'Completed',
      trackingStatus: 'DELIVERED',
      packedAt: threeDaysAgo,
      dispatchedAt: twoDaysAgo,
      deliveredAt: yesterday,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_002',
      razorpayPaymentId: 'pay_demo_v4_554129',
      verifiedAt: threeDaysAgo,
      createdAt: threeDaysAgo
    },
    {
      productId: createdProducts[3]._id, // Desi Chana
      productName: createdProducts[3].name,
      productImage: createdProducts[3].image,
      farmPhoto: createdProducts[3].farmPhoto,
      buyerId: getBuyerId(3), // Pooja Shah
      farmerId: farmer._id,
      quantity: 5,
      unitPrice: createdProducts[3].price,
      totalPrice: createdProducts[3].price * 5, // 68 * 5 = 340
      status: 'Pending',
      trackingStatus: 'ORDER_PLACED',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      createdAt: now
    },
    {
      productId: createdProducts[4]._id, // Green Chilli
      productName: createdProducts[4].name,
      productImage: createdProducts[4].image,
      farmPhoto: createdProducts[4].farmPhoto,
      buyerId: getBuyerId(4), // Aarav Sharma
      farmerId: farmer._id,
      quantity: 4,
      unitPrice: createdProducts[4].price,
      totalPrice: createdProducts[4].price * 4, // 45 * 4 = 180
      status: 'Accepted',
      trackingStatus: 'HARVEST_PACKED',
      packedAt: now,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      createdAt: yesterday
    },
    {
      productId: createdProducts[5]._id, // Oranges
      productName: createdProducts[5].name,
      productImage: createdProducts[5].image,
      farmPhoto: createdProducts[5].farmPhoto,
      buyerId: getBuyerId(5), // Sunil Mehta
      farmerId: farmer._id,
      quantity: 10,
      unitPrice: createdProducts[5].price,
      totalPrice: createdProducts[5].price * 10, // 55 * 10 = 550
      status: 'Completed',
      trackingStatus: 'DELIVERED',
      packedAt: twoDaysAgo,
      dispatchedAt: yesterday,
      deliveredAt: now,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_003',
      razorpayPaymentId: 'pay_demo_v4_881291',
      verifiedAt: twoDaysAgo,
      createdAt: twoDaysAgo
    },
    {
      productId: createdProducts[6]._id, // Basmati Paddy
      productName: createdProducts[6].name,
      productImage: createdProducts[6].image,
      farmPhoto: createdProducts[6].farmPhoto,
      buyerId: getBuyerId(0), // Meet Naik
      farmerId: farmer._id,
      quantity: 15,
      unitPrice: createdProducts[6].price,
      totalPrice: createdProducts[6].price * 15, // 42 * 15 = 630
      status: 'Accepted',
      trackingStatus: 'DISPATCHED',
      packedAt: yesterday,
      dispatchedAt: now,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_bas_01',
      razorpayPaymentId: 'pay_demo_v4_bas_01',
      verifiedAt: yesterday,
      createdAt: yesterday
    },
    {
      productId: createdProducts[7]._id, // Tur Dal
      productName: createdProducts[7].name,
      productImage: createdProducts[7].image,
      farmPhoto: createdProducts[7].farmPhoto,
      buyerId: getBuyerId(1), // Priya Sharma
      farmerId: farmer._id,
      quantity: 5,
      unitPrice: createdProducts[7].price,
      totalPrice: createdProducts[7].price * 5, // 135 * 5 = 675
      status: 'Completed',
      trackingStatus: 'DELIVERED',
      packedAt: threeDaysAgo,
      dispatchedAt: twoDaysAgo,
      deliveredAt: yesterday,
      paymentMethod: 'Razorpay',
      paymentProvider: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_demo_v4_004',
      razorpayPaymentId: 'pay_demo_v4_773192',
      verifiedAt: threeDaysAgo,
      createdAt: threeDaysAgo
    }
  ];

  const createdOrders = await Order.insertMany(demoOrders);

  return {
    usersCount: Object.keys(seededUsers).length,
    productsCount: createdProducts.length,
    ordersCount: createdOrders.length,
    demoAccounts: [
      { role: 'Farmer', email: 'hetnaik178@gmail.com', pass: 'het@171925' },
      { role: 'Buyer', email: 'naikmeet2535@gmail.com', pass: 'naikmeet2535' },
      { role: 'Expert', email: 'jeet@gmail.com', pass: 'jeet123' },
      { role: 'Admin', email: 'admin@krushi.com', pass: 'Admin@123' }
    ],
    sampleOrderId: createdOrders[0]._id
  };
}

module.exports = { seedDemoData };
