const { createClient } = require('redis');
require('dotenv').config();

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_HOST) {
    console.log('⚠️ Redis yapılandırması bulunamadı, cache devre dışı');
    return null;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => {
      console.error('Redis hatası:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis bağlantısı başarılı');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis bağlantı hatası:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

// Cache helper fonksiyonları
const cacheGet = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get hatası:', error);
    return null;
  }
};

const cacheSet = async (key, value, ttl = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set hatası:', error);
    return false;
  }
};

const cacheDel = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete hatası:', error);
    return false;
  }
};

const cacheFlush = async (pattern) => {
  if (!redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache flush hatası:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheFlush
};
