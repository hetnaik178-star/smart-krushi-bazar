const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar';
const ROOT_DIR = path.join(__dirname, '../../../');
const DB_OUTPUT_DIR = path.join(ROOT_DIR, 'database');
const COLLECTIONS_DIR = path.join(DB_OUTPUT_DIR, 'collections');

async function exportDatabase() {
  console.log('====================================================');
  console.log('  Smart Krushi Bazar - Database Exporter');
  console.log('====================================================');

  if (!fs.existsSync(COLLECTIONS_DIR)) {
    fs.mkdirSync(COLLECTIONS_DIR, { recursive: true });
  }

  let connection = mongoose.connection;
  let shouldDisconnect = false;

  if (connection.readyState !== 1) {
    console.log(`Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    shouldDisconnect = true;
  }

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  console.log(`Found ${collections.length} collections in database "${db.databaseName}":`);
  
  const fullDump = {
    databaseName: db.databaseName,
    exportedAt: new Date().toISOString(),
    collections: {}
  };

  let totalDocs = 0;

  for (const col of collections) {
    const colName = col.name;
    // Skip system collections
    if (colName.startsWith('system.')) continue;

    const docs = await db.collection(colName).find({}).toArray();
    totalDocs += docs.length;

    // Save individual collection JSON
    const filePath = path.join(COLLECTIONS_DIR, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');

    fullDump.collections[colName] = docs;
    console.log(`  ✓ ${colName.padEnd(20)} -> ${docs.length.toString().padStart(4)} documents exported to database/collections/${colName}.json`);
  }

  // Save all-in-one dump
  const dumpPath = path.join(DB_OUTPUT_DIR, 'full_database_dump.json');
  fs.writeFileSync(dumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');

  console.log('----------------------------------------------------');
  console.log(`✅ Successfully exported ${totalDocs} total documents across ${collections.length} collections.`);
  console.log(`📁 Files saved in: ${DB_OUTPUT_DIR}`);
  console.log('====================================================');

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return { totalDocs, collectionsCount: collections.length };
}

if (require.main === module) {
  exportDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Export failed:', err);
      process.exit(1);
    });
}

module.exports = { exportDatabase };
