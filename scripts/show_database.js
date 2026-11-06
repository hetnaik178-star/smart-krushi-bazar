const mongoose = require('../backend/node_modules/mongoose');

async function showDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar';
  console.log('\n======================================================');
  console.log('🌾 SMART KRUSHI BAZAR - MONGODB DATABASE INSPECTOR');
  console.log('======================================================');
  console.log(`Connecting to: ${uri} ...\n`);

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const stats = [];
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      stats.push({
        Collection: col.name,
        'Total Documents': count,
        Status: count > 0 ? 'Active' : 'Empty'
      });
    }

    console.table(stats);
    console.log(`Total Collections: ${collections.length}\n`);

    console.log('------------------------------------------------------');
    console.log('KEY TEST ACCOUNTS IN DATABASE (users):');
    console.log('------------------------------------------------------');
    const users = await db.collection('users').find({
      email: { $in: ['admin@krushi.com', 'hetnaik178@gmail.com', 'farmer@krushi.com', 'buyer@krushi.com', 'expert@krushi.com'] }
    }, { projection: { name: 1, email: 1, role: 1, location: 1 } }).toArray();
    console.table(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Location: u.location || 'N/A' })));

    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

showDatabase();
