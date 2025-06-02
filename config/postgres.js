// config/postgres.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE, // database name
  process.env.PG_USER,     // username
  process.env.PG_PASSWORD, // password
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected via Sequelize'))
  .catch(err => console.error('❌ Unable to connect to PostgreSQL:', err));

module.exports = sequelize;
