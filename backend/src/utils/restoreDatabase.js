const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_krushi_bazar';
const ROOT_DIR = path.join(__dirname, '../../../');
const DB_INPUT_DIR = path.join(ROOT_DIR, 'database');
const COLLECTIONS_DIR = path.join(DB_INPUT_DIR, 'collections');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function convertTypes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertTypes);
  }
  if (obj !== null && typeof obj === 'object') {
    // Handle MongoDB extended JSON {$oid: '...'}
    if (obj.$oid && typeof obj.$oid === 'string') {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    // Handle MongoDB extended JSON {$date: '...'}
    if (obj.$date) {
      return new Date(obj.$date);
    }

    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '_id' && typeof value === 'string' && OBJECT_ID_REGEX.test(value)) {
        transformed[key] = new mongoose.Types.ObjectId(value);
      } else if (typeof value === 'string' && (key.endsWith('Id') || key === 'sender' || key === 'recipient') && OBJECT_ID_REGEX.test(value)) {
        transformed[key] = new mongoose.Types.ObjectId(value);
      } else if (typeof value === 'string' && (key.endsWith('At') || key.endsWith('Date')) && DATE_REGEX.test(value)) {
        transformed[key] = new Date(value);
      } else {
        transformed[key] = convertTypes(value);
      }
    }
    return transformed;
  }
  return obj;
}

async function restoreDatabase(options = { clearExisting: true }) {
  console.log('====================================================');
  console.log('  Smart Krushi Bazar - Database Restorer');
  console.log('====================================================');

  if (!fs.existsSync(COLLECTIONS_DIR)) {
    console.error(`❌ Backup collections directory not found: ${COLLECTIONS_DIR}`);
    return { success: false, message: 'Backup directory missing' };
  }

  let shouldDisconnect = false;
  if (mongoose.connection.readyState !== 1) {
    console.log(`Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    shouldDisconnect = true;
  }

  const db = mongoose.connection.db;
  const files = fs.readdirSync(COLLECTIONS_DIR).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} collection backup files to restore:`);

  let totalRestored = 0;

  for (const file of files) {
    const colName = path.basename(file, '.json');
    const filePath = path.join(COLLECTIONS_DIR, file);

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const rawDocs = JSON.parse(rawContent);

      if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
        console.log(`  ⚠ ${colName.padEnd(20)} -> Empty or invalid, skipped.`);
        continue;
      }

      const collection = db.collection(colName);

      if (options.clearExisting) {
        await collection.deleteMany({});
      }

      const transformedDocs = rawDocs.map(convertTypes);
      await collection.insertMany(transformedDocs, { ordered: false });

      totalRestored += transformedDocs.length;
      console.log(`  ✓ ${colName.padEnd(20)} -> ${transformedDocs.length.toString().padStart(4)} documents restored`);
    } catch (err) {
      console.error(`  ❌ Error restoring collection "${colName}":`, err.message);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`✅ Restore complete! Total ${totalRestored} documents restored into database "${db.databaseName}".`);
  console.log('====================================================');

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return { success: true, totalRestored };
}

if (require.main === module) {
  restoreDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Restore failed:', err);
      process.exit(1);
    });
}

module.exports = { restoreDatabase };
