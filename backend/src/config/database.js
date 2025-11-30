const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL bağlantısı başarılı');
    
    if (process.env.NODE_ENV === 'development') {
      // Development modunda tabloları senkronize et
      await sequelize.sync({ alter: true });
      console.log('✅ Veritabanı tabloları senkronize edildi');
    }
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
