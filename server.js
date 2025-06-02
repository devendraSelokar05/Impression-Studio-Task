const dotenv = require('dotenv');

dotenv.config();

const connectMongo = require('./config/mongodb');  
const pgPool = require('./config/postgres');       

const app = require('./app');

// initialise Mongo
connectMongo();


(async () => {
  try {
    await pgPool.query('SELECT 1');       
 
  } catch (e) {
    console.error('PostgreSQL ping failed', e);
  }
})();

const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`✅ MongoDB Server running on port ${PORT}`);
});
