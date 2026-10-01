const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Configure MongoDB Memory Server to download/cache on E:\ drive to avoid C:\ drive low disk space (0.09 GB on C vs 97 GB on E)
const cacheDir = path.resolve('E:/blood donar mangement system/.mongodb-cache');
if (!fs.existsSync(cacheDir)) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch (e) {}
}
process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
process.env.MONGOMS_CACHE_DIR = cacheDir;

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to configured MongoDB URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`Could not connect to external MongoDB (${err.message}). Falling back to in-memory database...`);
    }
  }

  try {
    console.log(`Starting In-Memory MongoDB Server (Caching on E: drive at ${cacheDir})...`);
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'blood_donor_db',
      },
      binary: {
        downloadDir: cacheDir,
      }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[In-Memory MongoDB Connected]: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error('CRITICAL: Failed to initialize MongoDB connection:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
