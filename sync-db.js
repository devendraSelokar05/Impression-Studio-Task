const sequelize = require('./config/postgres');


require('./models/postgres/user.model');
require('./models/postgres/categories.model');
require('./models/postgres/location.model');
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connection established.');

        // Sync all imported models
        await sequelize.sync()
        console.log('✅ All models synced with the database.');
    } catch (error) {
        console.error('❌ Failed to sync DB:', error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
